import { SnipsBuiltinEntityCategory } from "./snips-nlu-types";


export interface SnipsNLUDataset {
    language: string,
    intents: Map<string, SnipsIntent>,
    entities: Map<string, SnipsEntity>
}

export interface SnipsIntent {
    utterances: SnipsUtterance[]
}

export interface SnipsUtterance {
    data: SnipsUtteranceItem[];
}

export interface SnipsUtteranceItem {
    text: string,
    entity?: string,
    slot_name?: string
}

export interface SnipsEntity {
    data: SnipsEntityData[],
    use_synonyms: boolean,
    automatically_extensible: boolean,
    matching_strictness: number
}

export interface SnipsEntityData {
    value: string,
    synonyms: string[]
}

export const SnipsRegexEntityDeclaration = "\[\w+:\w+\]\(\w+\)"; // [slotName:slotType](slotValue) // [origin:city](Paris)

export interface SnipsBuiltinEntity {
    id: string,
    name: string,
    category: SnipsBuiltinEntityCategory,
    suported_languages: string[]
}
