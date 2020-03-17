import { Application as ExpressApp, Request, Response } from 'express'
import axios from "axios";

import {
    Channel, WebhookConfig, ChannelEvent,
    ChannelEventType, ChannelReply, ChannelReplyType, TextReply,
    TextEvent
} from '@maiara/core';
import { FacebookMessengerCredentials } from './credentials';
import { FacebookMessengerChannelConfig } from './config';


export const FACEBOOK_MESSENGER: string = "facebookMessenger";


export class FacebookMessengerChannel extends Channel {

    private credentials: FacebookMessengerCredentials;
    private sendTextUrl: string;

    constructor(config: FacebookMessengerChannelConfig) {
        super();

        if (!config.credentials || !config.credentials.pageAccessToken || !config.credentials.verifyToken) {
            throw Error("Invalid credentials");
        }

        this.credentials = config.credentials;
        this.sendTextUrl = `https://graph.facebook.com/v4.0/me/messages?access_token=${config.credentials.pageAccessToken}`;
    }

    /** Create webhook endpoints in an Express application if needed. */
    setWebhooks(expressApp: ExpressApp, webhookConfig: WebhookConfig): void {
        if (!expressApp) {
            throw Error("[FacebookMessengerChannel] An express app is needed.");
        }
        if (!webhookConfig || !webhookConfig.publicDomain) {
            throw Error("[FacebookMessengerChannel] A public domain is needed.");
        }
        if (!webhookConfig || webhookConfig.https === false) {
            throw Error("[FacebookMessengerChannel] Facebook Messenger only accepts https.");
        }

        let endpoint = webhookConfig.endpoint ? webhookConfig.endpoint : "/facebook-messenger";
        if (!endpoint.startsWith("/")) {
            endpoint = "/" + endpoint;
        }
        
        expressApp.post(endpoint, (req, res) => this.onNewEventReceived(req, res));
        expressApp.get(endpoint, (req, res) => this.onVerificationRequest(req, res));
    }

    private onNewEventReceived(req: Request, res: Response) {
        // Check the webhook event is from a Page subscription
        if (req.body.object === 'page') {

            // Return a '200 OK' response to all events
            res.status(200).send('EVENT_RECEIVED');
            console.log("[FacebookMessengerChannel] Event received");

            // Iterate over each entry - there may be multiple if batched
            req.body.entry.forEach(entry => {
                // Get the webhook event. entry.messaging is an array, but
                // will only ever contain one event, so we get index 0
                let webhook_event = entry;
                if (entry.messaging && entry.messaging.length > 0) {
                    webhook_event = entry.messaging[0];
                }

                if (webhook_event.delivery) {
                    return;
                }

                this.emitEvent(this.parseMessage(webhook_event));
            });
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            console.warn("[FacebookMessengerChannel] 404");
            res.sendStatus(404);
        }
    }

    private onVerificationRequest(req: Request, res: Response) {
        // Parse params from the webhook verification request
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        // Check if a token and mode were sent
        if (mode && token) {

            // Check the mode and token sent are correct
            if (mode === 'subscribe' && token === this.credentials.verifyToken) {

                // Respond with 200 OK and challenge token from the request
                console.log('[FacebookMessengerChannel] Webhook verified');
                res.status(200).send(challenge);

            } else {
                // Respond with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(400);
        }
    }

    /** Use this function to send one or more messages to the user of the original message. */
    reply(receivedMessage: ChannelEvent, reply: ChannelReply): void {
        if (reply.type === ChannelReplyType.Text) {
            const requestBody: any = {
                recipient: {
                    id: receivedMessage.user.id
                },
                message: {
                    text: (<TextReply> reply).text
                }
            }

            if ((<TextReply>reply).quickReplies && (<TextReply>reply).quickReplies.length > 0) {
                requestBody.message.quick_replies = this.buildQuickReplies(<TextReply>reply);
            }

            axios.post(this.sendTextUrl, requestBody)
                .then(response => {
                    // console.log(response);
                    console.log(`[FacebookMessengerChannel] Replied to message: ${requestBody.message.text}`);
                })
                .catch(error => {
                    console.error(error);
                });
        }
        // // else throw Error / console.warning ?
    }

    private parseMessage(webhookEvent: any): ChannelEvent {

        console.log("[FacebookMessengerChannel] Webhook event", JSON.stringify(webhookEvent, null, 4));

        const messageType = this.getMessageType(webhookEvent);

        const generalData: ChannelEvent = {
            type: messageType,
            sourceChannel: FACEBOOK_MESSENGER,
            locale: "",
            timestamp: null,
            user: {
                id: webhookEvent.sender.id
            },
            raw: webhookEvent
        }

        if (messageType == ChannelEventType.Text)
            return this.buildTextEvent(webhookEvent, generalData);
        
        return generalData;
    }

    private buildTextEvent(webhookEvent: any, generalData: ChannelEvent): TextEvent {
        const event = <TextEvent> generalData;
        event.text = this.getMessageText(webhookEvent);
        return event;
    }

    private getMessageText(webhookEvent: any): string {
        if (webhookEvent.message && webhookEvent.message.text) {
            return webhookEvent.message.text;
        } else if (webhookEvent.received_postback && webhookEvent.received_postback.payload) {
            return webhookEvent.received_postback.payload;
        } else {
            return "";
        }
    }

    private getMessageType(webhookEvent: any): ChannelEventType {
        if ((webhookEvent.message && webhookEvent.message.text) ||
            (webhookEvent.received_postback && webhookEvent.received_postback.payload)) {
                return ChannelEventType.Text;
        } else {
            return ChannelEventType.Unknown;
        }
    }

    private buildQuickReplies(reply: TextReply): any[] {
        if (!reply || !reply.quickReplies || reply.quickReplies.length === 0)
            return null;

        const quickRepliesRemovedEmpty = reply.quickReplies.filter(quickReply => quickReply && quickReply.trim().length > 0);

        if (quickRepliesRemovedEmpty.length === 0) {
            return null;
        }

        return quickRepliesRemovedEmpty.map(quickReply => {
            return {
                content_type: "text",
                title: quickReply,
                payload: quickReply,
                image_url: ""
            };
        });
    }


}
