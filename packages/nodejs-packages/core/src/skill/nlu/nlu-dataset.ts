
export interface NLUDataset {
    language: string;
    intents: Intent[];
    entities: Entity[];
    systemEntities: SystemEntity[];
}

export interface Intent {
    name: string;
    utterances: Utterance[];
}

export type Utterance = UtteranceItem[];

export interface UtteranceItem {
    text: string;
    entity?: string;
    slotName?: string;
}

export interface Entity {
    name: string;
    data: EntityData[];
}

export interface EntityData {
    value: string;
    synonyms: string[];
}

export interface SystemEntity {
    name: string;
    enabled: boolean;
}
