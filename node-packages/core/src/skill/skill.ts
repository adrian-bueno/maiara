import { Dialog } from "./dialog";
import { NLUDataset } from "./nlu";

export interface Skill {
    id: string;
    name?: string;
    description?: string;
    nluEngine?: string;
    nluDataset?: NLUDataset;
    dialog?: Dialog;
    language?: string;
}

// export interface SkillOnlyDialog {
//     id: string;
//     dialog: Dialog;
//     language: string;
// }

export interface MultiLanguageSkill {
    id: string;
    name?: string;
    description?: string;
    languages: string[];
    skills?: Map<string, Skill>; // key = language
}
