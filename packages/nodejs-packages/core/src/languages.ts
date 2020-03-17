export interface Language {
    [key:string]: {
        id: string,
        name: string
    }
}

export const LANGUAGES = {
    german:           { id: "de",    name: "German" },
    english:          { id: "en",    name: "English" },
    spanish:          { id: "es",    name: "Spanish" },
    french:           { id: "fr",    name: "French" },
    italian:          { id: "it",    name: "Italian" },
    portugueseEurope: { id: "pt_pt", name: "Portuguese - Europe" },
    portugueseBrazil: { id: "pt_br", name: "Portuguese - Brazil" },
    japanese:         { id: "ja",    name: "Japanese" },
    korean:           { id: "ko",    name: "Korean" },
};
