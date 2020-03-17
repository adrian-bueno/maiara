export interface ChannelConfig {
    channelType: string; // telegram, facebookMessenger, etc...
}



export interface TelegramCredentials {
    token: string;
}

export interface TelegramChannelConfig extends ChannelConfig {
    credentials: TelegramCredentials;
    polling: boolean;
    publicDomain: string;
    endpoint: string;
}
