import { Context, ContextVariables } from "../../context";
import { NLUResult } from "../nlu/nlu-result";
import { Dialog, DialogNode, DialogCondition, DialogFallback } from "./dialog";
import { DialogAction, DialogActionType, SendTextDialogAction, AssignContextVariableDialogAction } from "./dialog-action";
import { generateConditionFunction, parseStringWithValues } from '../../parser';
import { Channel, Message, TextReply, ReplyType } from "../../channel";


export interface DialogEngineInput {
    channel: Channel;
    message: Message;
    nluResult: NLUResult;
    context: Context;
}

export interface DialogEngineOutput {
    context: Context;
    fallback?: DialogEngineFallback;
}

interface DialogEngineNode {
    id: string;
    actions: DialogAction[];
    conditions: DialogEngineNodeCondition[];
    fallback: DialogFallback;
}

interface DialogEngineNodeCondition {
    function: Function; // (nluResult: NLUResult, contextVariables: ContextVariables) => boolean
    goToNode: string;
}

interface DialogEngineFallback {
    changeContext?: boolean;
    returnHereOnContextChangeEnd?: boolean;
}


function mapNodeToEngineNode(node: DialogNode): DialogEngineNode {
    const actions = [...node.actions];
    const conditions = node.conditions
        .filter(condition => condition.goToNode && condition.text)
        .map(condition => {
            return {
                function: generateConditionFunction(condition.text),
                goToNode: condition.goToNode
            }
        });

    return {
        id: node.id,
        actions,
        conditions,
        fallback: node.fallback
    };
}

function mapNodeToEngineFallback(node: DialogEngineNode): DialogEngineFallback {
    return {
        changeContext: node.fallback.changeContext,
        returnHereOnContextChangeEnd: node.fallback.returnHereOnContextChangeEnd
    };
}


export class DialogEngine {

    nodesMap = new Map<string, DialogEngineNode>();

    constructor(dialog: Dialog) {
        if (!dialog) {
            throw Error("Empty dialog");
        }
        dialog.nodes.forEach(node => this.nodesMap.set(node.id, mapNodeToEngineNode(node)));

        if (!this.nodesMap.has("start")) {
            throw Error("No start node");
        }
    }

    process(input: DialogEngineInput): DialogEngineOutput {

        console.log("CONTEXT_1", JSON.stringify({ context: input.context }, null, 4));

        let currentNodeId: string = "start";
        if (input.context.currentNodeId) {
            currentNodeId = input.context.currentNodeId;
        }
        let currentNode = this.nodesMap.get(currentNodeId);

        // If node doesnt exist (e.g. dialog changed), go to start node
        if (!currentNode) {
            currentNode = this.nodesMap.get("start")
            input.context.currentNodeId = "start";
        }

        if (input.context.onFlowEndReturnTo
            && input.context.onFlowEndReturnTo.nodeId === currentNode.id
            && currentNode.fallback.onContextReturnResponse
            && currentNode.fallback.onContextReturnResponse.text.trim().length !== 0) {
                input.channel.reply(input.message,
                    <TextReply> {
                        type: ReplyType.Text,
                        text: parseStringWithValues(currentNode.fallback.onContextReturnResponse.text, input.nluResult, input.context.variables),
                        quickReplies: this.processQuickReplies(currentNode.fallback.onContextReturnResponse.quickReplies, input)
                    });
                input.context.currentNodeId = input.context.onFlowEndReturnTo.nodeId;
                input.context.currentSkillId = input.context.onFlowEndReturnTo.skillId;
                input.context.onFlowEndReturnTo = null;
                return { context: input.context };
        }

        const isEndNode: boolean = currentNode.conditions.length === 0;

        if (isEndNode) {
            input.context = this.processActions(input, currentNode);
            input.context.currentNodeId = null; // Start again
            input.context.currentSkillId = null;

            console.log("LEAF NODE", JSON.stringify({ context: input.context }, null, 4));

            return { context: input.context };
        }

        // Get next node
        let nextNodeId: string;
        for (const condition of currentNode.conditions) {
            if (condition.function(input.nluResult, input.context.variables)) {
                nextNodeId = condition.goToNode;
                break;
            }
        }

        // If no nextNode
        if (!nextNodeId) {

            const hasFallback: boolean =
                    Boolean((currentNode.fallback && currentNode.fallback.response && currentNode.fallback.response.text)
                        || (currentNode.fallback && currentNode.fallback.changeContext));

            // Change context
            if (hasFallback && currentNode.fallback.changeContext) {
                return {
                    context: input.context,
                    fallback: mapNodeToEngineFallback(currentNode)
                }
            // Reply with fallback response
            } else if (hasFallback && currentNode.fallback.response && currentNode.fallback.response.text) {
                input.channel.reply(input.message,
                    <TextReply> {
                        type: ReplyType.Text,
                        text: parseStringWithValues(currentNode.fallback.response.text, input.nluResult, input.context.variables),
                        quickReplies: this.processQuickReplies(currentNode.fallback.response.quickReplies, input)
                    });
                return { context: input.context };
            } else {
                input.channel.reply(input.message,
                    <TextReply> {
                        type: ReplyType.Text,
                        text: "(An error occurred: no fallback)",
                        quickReplies: []
                    });

                // TODO try to change context

                return { context: input.context };
            }

        }

        const nextNode = this.nodesMap.get(nextNodeId);
        input.context.currentNodeId = nextNodeId;

        input.context = this.processActions(input, nextNode);

        const nextNodeIsEnd: boolean = nextNode.conditions.length === 0;

        if (nextNodeIsEnd) {
            input.context.currentNodeId = null; // Start again
            input.context.currentSkillId = null;
        }

        console.log("CONTEXT_2", JSON.stringify({ context: input.context }, null, 4));
        return { context: input.context };
    }

    private processActions(input: DialogEngineInput, node: DialogEngineNode): Context {

        node.actions.forEach(action => {
            if (action.type === DialogActionType.SendText) {
                const a = <SendTextDialogAction> action;
                if (a.text && a.text.trim()) {
                    input.channel.reply(input.message,
                        <TextReply> {
                            type: ReplyType.Text,
                            text: parseStringWithValues(a.text, input.nluResult, input.context.variables),
                            quickReplies: this.processQuickReplies(a.quickReplies, input)
                        });
                }
            } else if (action.type === DialogActionType.AssignContextVariable) {
                const a = <AssignContextVariableDialogAction> action;
                if (a.variableName) {
                    input.context.variables.set(a.variableName, parseStringWithValues(<string> a.value, input.nluResult, input.context.variables));
                }
            }
        })

        return input.context;
    }

    private processQuickReplies(quickReplies: string[], input: DialogEngineInput) {
        if (!quickReplies) {
            return null;
        }
        return quickReplies.map(quickReply => parseStringWithValues(quickReply, input.nluResult, input.context.variables));
    }

    processChangeContextNotSuccesful(input: DialogEngineInput): DialogEngineOutput {
        const node = this.nodesMap.get(input.context.currentNodeId);

        if (node.fallback && node.fallback.response) {
            input.channel.reply(input.message,
                <TextReply> {
                    type: ReplyType.Text,
                    text: node.fallback.response.text,
                    quickReplies: node.fallback.response.quickReplies
                });
        }

        return { context: input.context };
    }

    processChangeContextReturn(input: DialogEngineInput): DialogEngineOutput {
        const node = this.nodesMap.get(input.context.currentNodeId);

        if (node.fallback && node.fallback.onContextReturnResponse) {
            input.channel.reply(input.message,
                <TextReply> {
                    type: ReplyType.Text,
                    text: node.fallback.onContextReturnResponse.text,
                    quickReplies: node.fallback.onContextReturnResponse.quickReplies
                });
        }

        return { context: input.context };
    }

}
