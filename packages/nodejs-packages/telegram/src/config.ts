import { ChannelConfig } from '@maiara/core';

import { TelegramCredentials } from './credentials';


export interface TelegramChannelConfig extends ChannelConfig {
    credentials: TelegramCredentials;
    polling: boolean;
    publicDomain: string;
    endpoint: string;
}