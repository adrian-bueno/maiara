import { Component, ChangeDetectorRef, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';

import { Dialog, DialogNode, DialogPoint, DialogEdge, DialogEdgeStart, DialogEdgeEnd, DialogCondition, DialogFallback } from '../models/dialog';
import { NodePortEventData, PortType } from './node';
import { DialogActionType, DialogAction } from '../models';
import { SkillService } from '../../skill.service';


@Component({
    selector: 'dialog-editor',
    templateUrl: './dialog-editor.component.html',
    styleUrls: ['./dialog-editor.component.scss']
})
export class DialogEditorComponent implements OnInit {

    dialog: Dialog;
    @Output() dialogChange = new EventEmitter<Dialog>();

    newEdge: DialogEdge;
    edgeMapOutputs: Map<string, DialogEdge> = new Map<string, DialogEdge>(); // References to output edges
    edgeMapInputs: Map<string, DialogEdge[]> = new Map<string, DialogEdge[]>(); // Reference to input edges
    newEdgeTimeout: any;
    selectedNodeIndex: number;
    selectedNode: DialogNode;
    nodeEditorActiveClases: string;
    isNodeEditorOpen: boolean = false;
    isNodeEditorFirstChange: boolean = true;
    movingNodeDiffPosition: DialogPoint = { x: 0, y: 0 }; // helper
    scrollMap: Map<string, DialogPoint> = new Map<string, DialogPoint>(); // key = nodeId, value = last scroll position

    @ViewChild("dialogEditorContainerElem", { static: false }) dialogEditorContainerElem: ElementRef;

    readonly Y_CORRECTION: number = 90; // height in px of x2 top navbars


    constructor(private cdRef: ChangeDetectorRef, private skillService: SkillService) {

    }

    @Input("dialog")
    set _dialog(value: Dialog) {
        this.dialog = value;
        this.processEdges(this.dialog);

        if (this.selectedNode) {
            const index = this.dialog.nodes.findIndex(node => node.id === this.selectedNode.id);
            if (index > -1) {
                this.selectedNode = this.dialog.nodes[index];
            } else {
                this.closeNodeEditor();
            }
        }
    }

    print() {
        console.log(this.dialog);
        console.log(JSON.stringify(this.dialog));
    }

    ngOnInit() {
        this.updateNodeEditorActiveClases();
    }

    private getEdgeIdOutput(nodeStartId: string, nodeStartActionIndex: number, nodeEndId: string): string {
        return `${nodeStartId}_${nodeStartActionIndex}_${nodeEndId}`;
    }

    private getNode(nodeId: string): DialogNode {
        for (const node of this.dialog.nodes) {
            if (node.id === nodeId) {
                return node;
            }
        }
    }

    private getIndexOfNode(node: DialogNode) {
        let i = 0;
        for (let n of this.dialog.nodes) {
            if (n.id === node.id) {
                return i;
            }
            i++;
        }
    }

    private normalizePosition(x: number, y: number): DialogPoint {
        return {
            x: x + this.dialogEditorContainerElem.nativeElement.scrollLeft,
            y: y + this.dialogEditorContainerElem.nativeElement.scrollTop - this.Y_CORRECTION
        };
    }

    processEdges(dialog: Dialog) {

        this.edgeMapOutputs = new Map<string, DialogEdge>();
        this.edgeMapInputs = new Map<string, DialogEdge[]>();

        if (!dialog || !dialog.edges) {
            return;
        }

        dialog.edges.forEach(edge => {
            // Set outputs
            const edgeId = this.getEdgeIdOutput(edge.start.nodeId, edge.start.conditionIndex, edge.end.nodeId);
            this.edgeMapOutputs.set(edgeId, edge);
            // Set inputs
            const edgesInput = this.edgeMapInputs.get(edge.end.nodeId);
            if (edgesInput) {
                edgesInput.push(edge);
            } else {
                this.edgeMapInputs.set(edge.end.nodeId, [edge]);
            }
        });
    }

    newEmptyNode() {
        const newEmptyNode: DialogNode = {
            id: "node-" + Date.now(),
            name: "",
            position: {
                x: 150 + this.dialogEditorContainerElem.nativeElement.scrollLeft,
                y: 25 + this.dialogEditorContainerElem.nativeElement.scrollTop
            },
            actions: [],
            conditions: [],
            fallback: {
                changeContext: false,
                returnHereOnContextChangeEnd: false,
                onContextReturnResponse: {
                    type: DialogActionType.SendText,
                    text: "",
                    quickReplies: []
                },
                response: {
                    type: DialogActionType.SendText,
                    text: "",
                    quickReplies: []
                }
            }
        };
        this.dialog.nodes.push(newEmptyNode);
        this.skillService.addNodeNotActiveDialogs(newEmptyNode);
        this.cdRef.detectChanges();
    }

    onNodeClick(index: number, node: DialogNode) {
        this.openNodeEditor(index, node);
    }

    onNodeMoveStart(index: number, node: DialogNode) {
        let lastScrollPosition = this.scrollMap.get(node.id);

        if (!lastScrollPosition) {
            lastScrollPosition = { x: 0, y: 0 };
        }

        const scrollPosition = {
            x: this.dialogEditorContainerElem.nativeElement.scrollLeft,
            y: this.dialogEditorContainerElem.nativeElement.scrollTop
        }

        const diff = {
            x: scrollPosition.x - lastScrollPosition.x,
            y: scrollPosition.y - lastScrollPosition.y
        }

        this.onNodeMove(index, node, diff);

        this.scrollMap.set(node.id, scrollPosition);
    }

    onNodeMove(index: number, node: DialogNode, diffPoint: DialogPoint) {
        // console.log(diffPoint);

        // Update helper variable
        this.movingNodeDiffPosition.x += diffPoint.x;
        this.movingNodeDiffPosition.y += diffPoint.y;

        // Input edges
        const edgesInput: DialogEdge[] = this.edgeMapInputs.get(node.id);
        if (edgesInput && edgesInput.length > 0) {
            edgesInput.forEach(edge => {
                edge.end.position = {
                    x: edge.end.position.x + diffPoint.x,
                    y: edge.end.position.y + diffPoint.y
                };
            })
        }

        // Output edges
        let i = 0;
        for (let condition of node.conditions) {
            const edgeId = this.getEdgeIdOutput(node.id, i, condition.goToNode);
            const edge = this.edgeMapOutputs.get(edgeId);
            if (edge) {
                edge.start.position = {
                    x: edge.start.position.x + diffPoint.x,
                    y: edge.start.position.y + diffPoint.y
                };
            }
            i++;
        }

        this.cdRef.detectChanges();
    }

    onNodeMoveEnd(index: number, node: DialogNode) {
        this.dialog.nodes[index] = {
            ...node,
            ...{
                position: {
                    x: node.position.x + this.movingNodeDiffPosition.x,
                    y: node.position.y + this.movingNodeDiffPosition.y,
                }
            }
        }

        this.movingNodeDiffPosition = { x: 0, y: 0 };

        if (this.selectedNode && this.selectedNode.id === node.id) {
            this.selectedNode = this.dialog.nodes[index];
        }

        this.dialog.edges = Array.from(this.edgeMapOutputs.values()); // Not the best way, but it works

        this.cdRef.detectChanges();

        this.skillService.updateNodeNameAndPositionNotActiveDialogs(this.dialog.nodes[index]);
        this.skillService.updateEdgesNotActiveDialogs(this.dialog.edges);
    }

    onNewEdgeStart(index: number, node: DialogNode, event: NodePortEventData) {
        const position = this.normalizePosition(event.position.x, event.position.y);

        let start: DialogEdgeStart;
        let end: DialogEdgeEnd;

        this.newEdge = undefined;
        if (event.portType === PortType.Output) {
            start = {
                nodeId: node.id,
                conditionIndex: event.conditionIndex,
                position: position
            };
            end = {
                nodeId: undefined,
                position: position
            };
        } else {
            start = {
                nodeId: undefined,
                conditionIndex: undefined,
                position: position
            };
            end = {
                nodeId: node.id,
                position: position
            };
        }
        this.newEdge = { start, end };
        this.cdRef.detectChanges();
    }

    onNewEdgeMoving(index: number, node: DialogNode, event: NodePortEventData) {
        const position = this.normalizePosition(event.position.x, event.position.y);
        if (event.portType === PortType.Output) {
            this.newEdge.end.position = position;
        } else {
            this.newEdge.start.position = position;
        }
        this.cdRef.detectChanges();
    }


    onNewEdgeEnd(index: number, node: DialogNode, event: NodePortEventData) {
        if (node.id === this.newEdge.start.nodeId || node.id === this.newEdge.end.nodeId) {
            this.newEdgeTimeout = setTimeout(() => {
                this.newEdge = undefined;
                this.cdRef.detectChanges();
            }, 100);
        } else {
            const position = this.normalizePosition(event.position.x, event.position.y);

            // If from output to input
            if (event.portType === PortType.Input && this.newEdge.start.nodeId) {
                this.newEdge.end.position = position;
                this.newEdge.end.nodeId = node.id;
            }
            // If from input to output
            else if (event.portType === PortType.Output && this.newEdge.end.nodeId) {
                this.newEdge.start.position = position;
                this.newEdge.start.nodeId = node.id;
                this.newEdge.start.conditionIndex = event.conditionIndex;
            }
            // If from input to input || If from output to output
            else {
                return;
            }

            const startNode = this.getNode(this.newEdge.start.nodeId);
            const currentEdgeId = this.getEdgeIdOutput(startNode.id,
                                                 this.newEdge.start.conditionIndex,
                                                 startNode.conditions[this.newEdge.start.conditionIndex].goToNode);

            const newEdgeId = this.getEdgeIdOutput(this.newEdge.start.nodeId,
                                             this.newEdge.start.conditionIndex,
                                             this.newEdge.end.nodeId);
            const newEdge: DialogEdge = JSON.parse(JSON.stringify(this.newEdge));

            // Max 1 edge per output port
            if (currentEdgeId !== newEdgeId) {
                this.edgeMapOutputs.delete(currentEdgeId);
                const currentEdgeIndex = this.dialog.edges
                    .findIndex(e => e.start.nodeId === newEdge.start.nodeId &&
                                    e.start.conditionIndex === newEdge.start.conditionIndex);
                this.dialog.edges.splice(currentEdgeIndex, 1);
            }

            startNode.conditions[this.newEdge.start.conditionIndex].goToNode = this.newEdge.end.nodeId;

            this.edgeMapOutputs.set(newEdgeId, newEdge);

            const nodeInputs = this.edgeMapInputs.get(this.newEdge.end.nodeId);
            if (nodeInputs) {
                nodeInputs.push(newEdge);
            } else {
                this.edgeMapInputs.set(this.newEdge.end.nodeId, [newEdge]);
            }

            this.dialog.edges.push(newEdge);

            this.cdRef.detectChanges();

            this.skillService.addEdge(newEdge);
        }
    }

    deleteEdge(edge: DialogEdge) {
        if (!edge)
            return;

        const edgeId = this.getEdgeIdOutput(edge.start.nodeId, edge.start.conditionIndex, edge.end.nodeId);
        this.edgeMapOutputs.delete(edgeId);

        const nodeInputs = this.edgeMapInputs.get(edge.end.nodeId);
        if (nodeInputs) {
            let index = nodeInputs.indexOf(edge);
            nodeInputs.splice(index, 1);
        }

        // Remove nodeId from node condition
        const node = this.getNode(edge.start.nodeId);
        node.conditions[edge.start.conditionIndex].goToNode = undefined;

        this.dialog.edges = Array.from(this.edgeMapOutputs.values()); // Not the best way, but it works

        // TODO update service

        this.cdRef.detectChanges();

        this.skillService.deleteEdge(edge);
    }


    private updateNodeEditorActiveClases() {
        if (this.isNodeEditorFirstChange && this.isNodeEditorOpen)
            this.nodeEditorActiveClases = "is-open";
        else if (this.isNodeEditorFirstChange && !this.isNodeEditorOpen)
            this.nodeEditorActiveClases = "is-closed";
        else if (!this.isNodeEditorFirstChange && this.isNodeEditorOpen)
            this.nodeEditorActiveClases = "open";
        else
            this.nodeEditorActiveClases = "close";
    }

    openNodeEditor(index: number, node: DialogNode) {
        if (this.isNodeEditorOpen && this.selectedNode.id === node.id) {
            this.closeNodeEditor();
        } else {
            this.selectedNodeIndex = undefined;
            this.selectedNode = undefined; // Destroy component first because content-editable-text doesnt update view. bug???
            this.cdRef.detectChanges();
            this.selectedNodeIndex = index;
            this.selectedNode = node;
            this.isNodeEditorOpen = true;
            this.isNodeEditorFirstChange = false;
            this.updateNodeEditorActiveClases();
            this.cdRef.detectChanges();
        }
    }

    closeNodeEditor() {
        // Dont close if node name is empty
        // if (!this.selectedNode.name) {
        //     return;
        // }
        setTimeout(() => {
            this.selectedNodeIndex = undefined;
            this.selectedNode = undefined;
            this.cdRef.detectChanges();
        }, 300);
        this.isNodeEditorOpen = false;
        this.isNodeEditorFirstChange = false;
        this.updateNodeEditorActiveClases();
        this.cdRef.detectChanges();
    }

    onNodeEditorChange(node: DialogNode) {
        const index = this.getIndexOfNode(node);
        this.dialog.nodes[index] = { ...node };

        this.cdRef.detectChanges();
    }

    onNodeEditorNameChanged(name: string) {
        this.skillService.updateNodeNameAndPositionNotActiveDialogs(this.selectedNode);
    }

    onNodeEditorConditionAdded($event: DialogCondition) {
        this.skillService.addNodeConditionNotActiveDialogs(this.selectedNode.id, $event);
    }

    onNodeEditorConditionTextChanged($event) {
        this.skillService.updateNodeConditionTextNotActiveDialogs(this.selectedNode.id, $event.index, $event.text);
    }

    onNodeEditorConditionDeleted(event: any) {
        const edgeId = this.getEdgeIdOutput(this.selectedNode.id, event.index, event.condition.goToNode);
        const edge = this.edgeMapOutputs.get(edgeId);

        if (edge) {
            // Delete edge
            const nodeInputs = this.edgeMapInputs.get(edge.end.nodeId);
            if (nodeInputs) {
                let index = nodeInputs.indexOf(edge);
                nodeInputs.splice(index, 1);
            }

            this.edgeMapOutputs.delete(edgeId);
        }

        // Update other condition edges
        this.selectedNode.conditions.forEach((condition, index) => {
            if (condition.goToNode && index >= event.index) {
                const edgeId = this.getEdgeIdOutput(this.selectedNode.id, index+1, condition.goToNode);
                const edge = this.edgeMapOutputs.get(edgeId);
                this.edgeMapOutputs.delete(edgeId);
                if (edge) {
                    edge.start.conditionIndex -= 1;
                    edge.start.position.y -= 30; // 30px (height of condition)
                    // Save edge with new ID
                    const newEdgeId = this.getEdgeIdOutput(this.selectedNode.id, index, condition.goToNode);
                    this.edgeMapOutputs.set(newEdgeId, edge);
                }
            }
        });

        this.dialog.edges = Array.from(this.edgeMapOutputs.values()); // Not the best way, but it works

        // TODO update service
        this.skillService.deleteNodeContidionNotActiveDialogs(this.selectedNode.id, event.index);

    }

    deleteSelectedNode() {
        // Dont delete node with "start" ID
        if (!this.selectedNode || (this.selectedNode && this.selectedNode.id === "start")) {
            return;
        }

        const selectedNodeIndex = this.selectedNodeIndex;
        const selectedNode = this.selectedNode;

        this.closeNodeEditor();

        // Delete input edges
        const inputEdges = this.edgeMapInputs.get(selectedNode.id);
        if (inputEdges) {
            inputEdges.forEach(edge => this.deleteEdge(edge));
            this.edgeMapInputs.delete(selectedNode.id);
        }

        // Delete output edges
        if (selectedNode.conditions) {
            selectedNode.conditions.forEach((condition, index) => {
                const edgeId = this.getEdgeIdOutput(selectedNode.id, index, condition.goToNode);
                this.deleteEdge(this.edgeMapOutputs.get(edgeId));
                this.edgeMapOutputs.delete(edgeId);
            });
        }

        // Delete node
        this.dialog.nodes.splice(selectedNodeIndex, 1);

        this.selectedNodeIndex = undefined;
        this.selectedNode = undefined;

        this.cdRef.detectChanges();

        this.skillService.deleteNodeNotActiveDialogs(selectedNode.id);
        this.skillService.updateEdgesNotActiveDialogs(this.dialog.edges);
    }

    onNodeEditorActionAdded($event: DialogAction) {
        this.skillService.addNodeActionNotActiveDialogs(this.selectedNode.id, $event);
    }

    onNodeEditorActionChanged($event: any) {
        this.skillService.updateNodeActionNotActiveDialogs(this.selectedNode.id, $event.index, $event.action);
    }

    onNodeEditorActionDeleted($event: number) {
        this.skillService.deleteNodeActionNotActiveDialogs(this.selectedNode.id, $event);
    }

    onFallbackChanged($event: DialogFallback) {
        this.skillService.updateFallbackBooleansNotActiveDialogs(this.selectedNode.id, $event);
    }

}
