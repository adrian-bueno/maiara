import { Subject } from 'rxjs';

import { WebhookConfig } from './webhook-config';
import { Message } from './message';
import { Reply } from './reply';



export interface ChannelConfig {
    channelType: string; // telegram, facebookMessenger, etc...
}


export interface Channel {

    /** Fires with every message received. */
    message$: Subject<Message>;

    /** Create necessary webhook endpoints in an Express application if needed. */
    setWebhooks(app: any, webhookConfig?: WebhookConfig): void;

    /** Use this function to send one or more messages to the user of the original message. */
    reply(receivedMessage: Message, reply: Reply): void;

}
