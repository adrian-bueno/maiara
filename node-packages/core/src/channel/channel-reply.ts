export enum ChannelReplyType {
    Text = "text",
    Image = "image",
    // Video = "video",
    // Location = "location",
    // RealTimeLocation = "real_time_location",
    // Audio = "audio",
    // File = "file",
    // Voice = "voice",
    // RealTimeVoice = "real_time_voice",
    // Contact = "contact"
}


export interface ChannelReply {
    type: string;
}

export interface TextReply extends ChannelReply {
    type: ChannelReplyType.Text;
    text: string;
    quickReplies?: string[];
}

export interface ImageReply extends ChannelReply {
    type: ChannelReplyType.Image;
    url?: string;
}
