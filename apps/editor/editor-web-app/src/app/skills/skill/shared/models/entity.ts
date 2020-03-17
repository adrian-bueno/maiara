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
