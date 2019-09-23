
export interface AssistantActiveServices {
    environmentId: string;
    skills: SkillNLUServiceState[];
    dialog: AssistantDialogServiceState;
}

export interface SkillNLUServiceState {
    skillId: string;
    language: string;
    endpoint: string;
    dockerContainerId: string;
}

export interface AssistantDialogServiceState {
    dockerContainerId: string;
}
