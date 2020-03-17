export interface RasaNLUDataset {
    language: string,
    rasa_nlu_data: {
        common_examples: RasaCommonExample[],
        regex_features: RasaRegexFeature[],
        lookup_tables: RasaLookupTable[],
        entity_synonyms: RasaEntitySynonyms[]
    }
}

export interface RasaCommonExample {
    text: string,
    intent: string,
    entities: RasaEntity[]
}

export interface RasaEntity {
    start: number,
    end: number,
    value: string,
    entity: string
}

export interface RasaEntitySynonyms {
    value: string,
    synonyms: string[]
}

export interface RasaRegexFeature {
    name: string,
    patter: string
}

export interface RasaLookupTable {
    name: string,
    elements: string | string[]
}


// CRFEntityExtractor, MitieEntityExtractor, SpacyEntityExtractor
