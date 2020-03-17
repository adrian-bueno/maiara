import { SkillDataset } from './dataset';
import { Dialog } from './dialog';


export interface Skill {
    id: string;
    name: string;
    description: string;
    nluDataset: SkillDataset;
    dialog: Dialog;
    language: string;
}

export interface MultiLanguageSkill {
    id: string;
    name: string;
    description: string;
    languages: string[];
    skills?: Map<string, Skill>; // key = language
}
