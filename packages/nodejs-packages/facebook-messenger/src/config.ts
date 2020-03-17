import { ChannelConfig } from "@maiara/core";

import { FacebookMessengerCredentials } from "./credentials";


export interface FacebookMessengerChannelConfig extends ChannelConfig {
    credentials: FacebookMessengerCredentials;
    publicDomain: string;
    endpoint: string;
}
