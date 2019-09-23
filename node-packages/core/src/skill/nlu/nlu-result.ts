
export interface NLUResult {
    input: string;
    intent: NLUIntentResult;
    slots: NLUSlotResult[];
}

export interface NLUIntentResult {
    name: string;
    probability: number;
}

export interface NLUSlotResult {
    name?: string;
    entity: string;
    rawValue: string;
    start: number;
    end: number;
    value: any;
}

export interface NLUSlotValue {
    kind: string;
    value: string;
    // TODO
}
