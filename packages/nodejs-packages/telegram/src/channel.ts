import { Application as ExpressApp } from 'express'
import TelegramBot from 'node-telegram-bot-api';
import { ReplyKeyboardMarkup, KeyboardButton, Message } from 'node-telegram-bot-api';

import {
    Channel, WebhookConfig, ChannelEvent, ChannelEventType,
    ChannelReply, ChannelReplyType, TextReply, TextEvent
} from '@maiara/core';
import { TelegramChannelConfig } from './config';


export const TELEGRAM: string = "telegram";


export class TelegramChannel extends Channel {

    private readonly bot: TelegramBot;
    private readonly polling: boolean;

    constructor(config: TelegramChannelConfig){
        super();
        this.polling = config.polling ? config.polling : false;

        if (!config.credentials || !config.credentials.token) {
            throw Error("Empty credentials");
        }

        this.bot = new TelegramBot(config.credentials.token, { polling: this.polling });

        this.bot.on('message', message => this.emitEvent(this.parseMessage(message)));
    }

    /** Create webhook endpoints in an Express application if needed. */
    setWebhooks(expressApp: ExpressApp, webhookConfig: WebhookConfig): void {
        if (this.polling === true) {
            console.warn('\x1b[33m%s\x1b[0m', "[TelegramChannel] Polling is enabled. Webhooks cannot be set.");
            return;
        }
        if (!expressApp) {
            console.error('\x1b[31m%s\x1b[0m', "[TelegramChannel] An express app is needed.");
            process.exit(1);
        }
        if (!webhookConfig || !webhookConfig.publicDomain) {
            console.error('\x1b[31m%s\x1b[0m', "[TelegramChannel] A public domain is needed.");
            process.exit(1);
        }
        if (!webhookConfig || webhookConfig.https === false) {
            console.error('\x1b[31m%s\x1b[0m', "[TelegramChannel] Telegram only accepts https.");
            process.exit(1);
        }

        let endpoint = webhookConfig.endpoint ? webhookConfig.endpoint : "/telegram";
        if (!endpoint.startsWith("/")) {
            endpoint = "/" + endpoint;
        }

        let url: string = `https://${webhookConfig.publicDomain}${endpoint}`;

        this.bot.setWebHook(url);
        // this.bot.getWebHookInfo().then(info => console.log(info));

        expressApp.post(endpoint, (req, res) => {
            this.bot.processUpdate(req.body);
            res.sendStatus(200);
        });
    }

    /** Use this function to send one or more messages to the user of the original message. */
    reply(receivedMessage: ChannelEvent, reply: ChannelReply): void {
        if (reply.type === ChannelReplyType.Text) {
            this.bot.sendMessage(receivedMessage.raw.chat.id, (<TextReply> reply).text,
                { reply_markup: this.buildQuickReplies((<TextReply> reply)) });
        }
        // else throw Error / console.warning ?
    }

    private parseMessage(telegramMessage: Message): ChannelEvent {
        const messageType = this.getMessageType(telegramMessage);

        const generalData: ChannelEvent = {
            sourceChannel: TELEGRAM,
            type: messageType,
            locale: telegramMessage.from.language_code,
            user: {
                id: String(telegramMessage.from.id), // and groups ??
                username: telegramMessage.from.username,
                name: telegramMessage.from.first_name,
                surnames: telegramMessage.from.last_name,
            },
            timestamp: new Date(telegramMessage.date).getUTCMilliseconds(),
            raw: telegramMessage
        }

        if (messageType == ChannelEventType.Text)
            return this.buildTextEvent(telegramMessage, generalData);

        return generalData;
    }

    private getMessageType(telegramMessage: Message): ChannelEventType {
        if (telegramMessage.text) {
            return ChannelEventType.Text;
        } else {
            return ChannelEventType.Unknown;
        }
    }

    private buildTextEvent(telegramMessage: Message, generalData: ChannelEvent): TextEvent {
        const event = <TextEvent> generalData;
        event.text = telegramMessage.text; // quickReplies ??;
        return event;
    }    

    private buildQuickReplies(reply: TextReply): ReplyKeyboardMarkup {
        if (!reply || !reply.quickReplies)
            return null;

        const keyboardButtons: KeyboardButton[][] = reply.quickReplies.map(text => {
            return [{ text }]
        });

        return {
            keyboard: keyboardButtons,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    }


}
