export interface Message {
    type: MessageType;
    timestamp?: string;
    sourceChannel: string;
    userId?: string;
    username?: string;
    locale?: string;
    text?: string;
    raw: any; // Full original message
    _loop?: number; // For loop detection in assistant and dialog engine
}

export enum MessageType {
    Text = "Text",
    NotSupported = "NotSupported"
}
