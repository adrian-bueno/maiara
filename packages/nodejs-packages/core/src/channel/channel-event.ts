import { Readable } from "stream";

import { ChannelUser } from "./channel-user";


export enum ChannelEventType {
    Text = "text",
    Image = "image",
    // Video = "video",
    // Location = "location",
    // RealTimeLocation = "real_time_location",
    // Audio = "audio",
    // File = "file",
    Voice = "voice",
    // RealTimeVoice = "real_time_voice",
    // Contact = "contact",
    Unknown = "unknown"
}


export interface ChannelEvent {
    sourceChannel: string;
    type: string;
    locale?: string;
    user?: ChannelUser;
    timestamp?: number;
    raw?: any;
    _loop?: number; // For loop detection in assistant and dialog engine
}

export interface TextEvent extends ChannelEvent {
    type: ChannelEventType.Text;
    text: string;
}

export interface ImageEvent extends ChannelEvent {
    type: ChannelEventType.Image;
    url?: string;
}

export interface VoiceEvent extends ChannelEvent {
    type: ChannelEventType.Voice;
    stream?: Readable;
    blob?: Blob;
}

// export interface RealTimeVoiceEvent extends ChannelEvent {
//     type: ChannelEventType.RealTimeVoice;
//     stream: Readable;
// }
