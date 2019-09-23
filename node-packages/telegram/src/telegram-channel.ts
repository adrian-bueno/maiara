import { Application as ExpressApp } from 'express'
import TelegramBot from 'node-telegram-bot-api';
import { ReplyKeyboardMarkup, KeyboardButton } from 'node-telegram-bot-api';
import { Subject } from 'rxjs';

import { Channel, ChannelConfig, WebhookConfig, Message, MessageType, Reply, ReplyType, TextReply } from '@maiara/core';
import { TelegramCredentials } from './telegram-credentials';
import { TelegramMessage } from './telegram-message';


export const TELEGRAM: string = "telegram";


export interface TelegramChannelConfig extends ChannelConfig {
    credentials: TelegramCredentials;
    polling: boolean;
    publicDomain: string;
    endpoint: string;
}


export class TelegramChannel implements Channel {

    private readonly bot: TelegramBot;
    private readonly polling: boolean;

    message$: Subject<Message>;

    constructor(config: TelegramChannelConfig){
        this.message$ = new Subject();
        this.polling = config.polling ? config.polling : false;

        if (!config.credentials || !config.credentials.token) {
            throw Error("Empty credentials");
        }

        this.bot = new TelegramBot(config.credentials.token, { polling: this.polling });

        this.bot.on('message', (message: TelegramMessage) => this.message$.next(this.parseMessage(message)));
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

        let url: string = `https://${webhookConfig.publicDomain}`;
        url += webhookConfig.endpoint ? webhookConfig.endpoint : "/telegram";

        this.bot.setWebHook(url);
        // this.bot.getWebHookInfo().then(info => console.log(info));

        expressApp.post(webhookConfig.endpoint ? webhookConfig.endpoint : "/telegram", (req, res) => {
            this.bot.processUpdate(req.body);
            res.sendStatus(200);
        });
    }

    /** Use this function to send one or more messages to the user of the original message. */
    reply(receivedMessage: Message, reply: Reply): void {
        if (reply.type === ReplyType.Text) {
            this.bot.sendMessage(receivedMessage.raw.chat.id, (<TextReply> reply).text,
                { reply_markup: this.buildQuickReplies((<TextReply> reply)) });
        }
        // else throw Error / console.warning ?
    }

    private parseMessage(telegramMessage: TelegramMessage): Message {
        return {
            type: this.getMessageType(telegramMessage),
            sourceChannel: TELEGRAM,
            text: telegramMessage.text, // quickReplies ??
            locale: telegramMessage.from.language_code,
            timestamp: new Date(telegramMessage.date).toISOString(),
            userId: String(telegramMessage.from.id), // and groups ??
            username: telegramMessage.from.username,
            raw: telegramMessage
        }
    }

    private getMessageType(telegramMessage: TelegramMessage): MessageType {
        if (telegramMessage.text) {
            return MessageType.Text;
        } else {
            return MessageType.NotSupported;
        }
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
