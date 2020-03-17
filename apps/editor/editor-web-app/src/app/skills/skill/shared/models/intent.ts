
export interface Intent {
    name: string;
    utterances: UtteranceItem[][];
}

export interface UtteranceItem {
    text: string;
    entity?: string;
    slotName?: string;
}
