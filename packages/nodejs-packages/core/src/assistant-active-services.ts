import { ObjectId } from 'mongodb';

export interface AssistantActiveServices {
    _id: ObjectId | string;
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
