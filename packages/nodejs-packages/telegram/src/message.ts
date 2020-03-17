
export interface TelegramUser {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username: string;
}

export interface TelegramMessageFrom extends TelegramUser {
    language_code: string;
}

export interface TelegramMessageChat {
    id: number;
    type: string;
}

export interface TelegramMessagePrivateChat extends TelegramMessageChat {
    type: 'private';
    first_name?: string;
    last_name?: string;
    username?: string;
}

export interface TelegramMessageGroupChat extends TelegramMessageChat {
    type: 'group'
    title?: string;
    all_members_are_administrators?: boolean;
}

export interface TelegramMessageEntity {
    offset: number;
    length: number;
    type: 'bot_command' | 'mention'; // bot_command (/start), mention (@username)
}

export interface TelegramFile {
    file_id: string;
    file_size: number;
}

export interface TelegramMediaFile {

}

export type TelegramMessageThumb = TelegramMessagePhoto;

export interface TelegramMessageDocument extends TelegramFile {
    file_name: string;
    mime_type: string;
    thumb: TelegramMessageThumb;
}

export interface TelegramMessageAudio extends TelegramFile {
    duration: number;
    mime_type: string;
    title: string;
    performer: string;
}

export interface TelegramMessageVoice extends TelegramFile {
    duration: number;
    mime_type: string;
}

export interface TelegramMessagePhoto extends TelegramFile {
    width: number;
    height: number;
}

export interface TelegramMessageVideo extends TelegramMessageDocument {
    // mime_type: 'video/mp4';
}

export interface TelegramMessageAnimation extends TelegramMessageDocument { // Video
    duration: number;
    width: number;
    height: number;
}

export interface TelegramMessageVideoNote extends TelegramFile {
    duration: number;
    length: number;
    thumb: TelegramMessageThumb;
}

export interface TelegramMessageSticker extends TelegramMessagePhoto {
    emoji: string; // '😂'
    set_name: string;
    thumb: TelegramMessageThumb;
}

export interface TelegramMessageLocation {
    latitude: number;
    longitude: number;
}

export interface TelegramMessageContact {
    phone_number: string;
    first_name: string;
    last_name?: string;
    // more data ???
}

export interface TelegramMessage {
    message_id: number;
    from: TelegramMessageFrom;
    chat: TelegramMessagePrivateChat | TelegramMessageGroupChat;
    date: number;
    text: string;
    entities?: TelegramMessageEntity[];
    group_chat_created?: boolean;
    document?: TelegramMessageDocument;
    audio?: TelegramMessageAudio;
    voice?: TelegramMessageVoice;
    photo?: TelegramMessagePhoto[];
    video_note?: TelegramMessageVideoNote;
    sticker: TelegramMessageSticker;
    caption: string; // text sended with photo or video
    new_chat_participant?: TelegramUser;
    new_chat_member?: TelegramUser;
    new_chat_members?: TelegramUser[];
    left_chat_participant: TelegramUser;
    left_chat_member: TelegramUser;
    location?: TelegramMessageLocation;
    contact?: TelegramMessageContact;
    reply_to_message: TelegramMessage;
}
