
// TODO remove context if last change > 1 day ?

export interface Context {
    currentSkillId: string;
    currentNodeId: string;
    language: string;
    variables: ContextVariables;
    onFlowEndReturnTo?: { // Return to this skill and node when current flow ends
        skillId: string;
        nodeId: string;
    }
}

export type ContextVariables = Map<string, string|number|boolean>;
