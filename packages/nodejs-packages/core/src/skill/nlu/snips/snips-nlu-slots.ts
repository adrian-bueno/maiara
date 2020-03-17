import { SnipsNLUSlotKind, SnipsPrecision, SnipsTimeGrain, SnipsTemperatureUnit } from "./snips-nlu-types";


export interface SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind;
}

export interface SnipsNLUSlotValueAmountOfMoney extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.AmountOfMoney;
    value: number;
    precision: SnipsPrecision;
    unit: string;
}

export interface SnipsNLUSlotValueCity extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.City;
    value: string;
}

export interface SnipsNLUSlotValueCountry extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Country;
    value: string;
}

export interface SnipsNLUSlotValueInstantTime extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.InstantTime;
    value: string;
    grain: SnipsTimeGrain;
    precision: SnipsPrecision;
}

export interface SnipsNLUSlotValueTimeInterval extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.TimeInterval;
    from: string;
    to: string;
}

export interface SnipsNLUSlotValueDuration extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Duration;
    years: number;
    quarters: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    precision: SnipsPrecision
}

export interface SnipsNLUSlotValueMusicAlbum extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.MusicAlbum;
    value: string;
}

export interface SnipsNLUSlotValueMusicArtist extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.MusicArtist;
    value: string;
}

export interface SnipsNLUSlotValueMusicTrack extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.MusicTrack;
    value: string;
}

export interface SnipsNLUSlotValueNumber extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Number;
    value: number;
}

export interface SnipsNLUSlotValueOrdinal extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Ordinal;
    value: number;
}

export interface SnipsNLUSlotValuePercentage extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Percentage;
    value: number;
}

export interface SnipsNLUSlotValueRegion extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Region;
    value: string;
}

export interface SnipsNLUSlotValueTemperature extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Temperature;
    value: number;
    unit: SnipsTemperatureUnit
}

export interface SnipsNLUSlotValueCustom extends SnipsNLUSlotValue {
    kind: SnipsNLUSlotKind.Custom;
    value: string;
}
