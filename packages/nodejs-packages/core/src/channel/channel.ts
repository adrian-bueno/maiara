import { EventEmitter } from 'events';

import { ChannelEvent } from './channel-event';
import { ChannelReply } from './channel-reply';


export declare interface Channel {

    /** Fires with every event received. */
    on(event: "event", listener: (event: ChannelEvent) => void): this;

}

export abstract class Channel extends EventEmitter {

    /** Use this function to send one or more messages to the user of the original message. */
    abstract reply(receivedEvent: ChannelEvent, reply: ChannelReply): void;

    protected emitEvent(event: ChannelEvent) {
        this.emit("event", event);
    }

}