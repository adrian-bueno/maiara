import { SnipsNLUSystemEntityType } from "./snips-nlu-types";
import { SnipsNLUSlotValue } from "./snips-nlu-slots";


export interface SnipsNLUResult {
    input: string;
    intent: SnipsNLUIntentResult;
    slots: SnipsNLUSlotResult[];
}

export interface SnipsNLUIntentResult {
    intentName: string;
    probability: number;
}

export interface SnipsNLUSlotResult {
    entity: string;
    range: SnipsNLURange;
    rawValue: string;
    slotName: string;
    value: SnipsNLUSlotValue;
}

export interface SnipsNLURange {
    start: number;
    end: number;
}
