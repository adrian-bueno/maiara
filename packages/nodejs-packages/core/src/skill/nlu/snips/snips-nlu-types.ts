
export enum SnipsBuiltinEntityCategory {
    GrammarEntity = "grammar_entity",
    GazetteerEntity = "gazetteer_entity"
}

export enum SnipsNLUSystemEntityType {
    AmountOfMoney = "snips/amountOfMoney",
    City          = "snips/city",
    Country       = "snips/country",
    Date          = "snips/date",
    DatePeriod    = "snips/datePeriod",
    DateTime      = "snips/datetime",
    Duration      = "snips/duration",
    MusicAlbum    = "snips/musicAlbum",
    MusicArtist   = "snips/musicArtist",
    MusicTrack    = "snips/musicTrack",
    Number        = "snips/number",
    Ordinal       = "snips/ordinal",
    Percentage    = "snips/percentage",
    Region        = "snips/region",
    Temperature   = "snips/temperature",
    Time          = "snips/time",
    TimePeriod    = "snips/timePeriod"
}

export enum SnipsNLUSlotKind {
    AmountOfMoney = "AmountOfMoney",
    City          = "City",
    Country       = "Country",
    InstantTime   = "InstantTime",
    TimeInterval  = "TimeInterval",
    Duration      = "Duration",
    MusicAlbum    = "MusicAlbum",
    MusicArtist   = "MusicArtist",
    MusicTrack    = "MusicTrack",
    Number        = "Number",
    Ordinal       = "Ordinal",
    Percentage    = "Percentage",
    Region        = "Region",
    Temperature   = "Temperature",
    Custom        = "Custom"
}

export enum SnipsTemperatureUnit {
    Celsius = "celsius",
    Fahrenheit = "fahrenheit"
}

export enum SnipsPrecision {
    Exact = "Exact",
    Approximate = "Approximate"
}

export enum SnipsTimeGrain {
    Second  = "Second",
    Minute  = "Minute",
    Hour    = "Hour",
    Day     = "Day",
    Week    = "Week",
    Month   = "Month",
    Quarter = "Quarter",
    Year    = "Year"
}
