import {
    Assistant, DialogEngineInput, DialogEngine, ChannelConfig, Channel,
    TextReply, ChannelReplyType, ExpressApp,
    Context, DialogEngineOutput, NLUResult, AssistantActiveServices,
    ChannelEvent, getRandomInteger, ChannelEventType, sleep, TextEvent
} from '@maiara/core';
import { TelegramChannel, TELEGRAM, TelegramChannelConfig } from '@maiara/telegram';
import { FACEBOOK_MESSENGER, FacebookMessengerChannelConfig, FacebookMessengerChannel } from '@maiara/facebook-messenger';
import { NLUServiceCaller } from './nlu-service-caller';
import { MinioStorage, MinioStorageConfig } from '@maiara/minio';
import { Db, MongoClient } from 'mongodb';
import cld from "cld";


export interface AssistantEngineConfig {
    assistantId: string;
    environmentId: string;
    app: ExpressApp;
    storageConfig: MinioStorageConfig;
}

export class AssistantEngine {

    private assistantId: string;
    private environmentId: string;
    private assistant: Assistant;
    private nluServiceMap: Map<string, Map<string, NLUServiceCaller>>; // skillId - Map(langCode - NLUServiceCaller)
    private dialogEngineMap: Map<string, Map<string, DialogEngine>>; // skillId - Map(langCode - DialogEngine)
    private storage: MinioStorage;
    private db: Db;


    constructor(config: AssistantEngineConfig) {
        this.assistantId = config.assistantId;
        this.environmentId = config.environmentId;
        Promise.all([
            this.configureStorage(config.storageConfig),
            this.configureDatabase()
        ])
        .then(async () => {
            const assistant = await this.getAssistantInfo(config.assistantId, config.environmentId);
            const activeServices = await this.getAssistantActiveServices(config.assistantId, config.environmentId);
            this.assistant = assistant;
            return { assistant, activeServices };
        })
        .then(async data => {
            this.configureChannels(data.assistant.channelsConfig, config.app);
            this.buildDialogEngineMap(data.assistant);
            this.buildNLUServiceMap(data.assistant, data.activeServices);
        });
    }

    private async configureStorage(storageConfig: MinioStorageConfig) {
        this.storage = new MinioStorage(storageConfig);
    }

    private async configureDatabase() {
        const mongoUrl = `mongodb://${process.env.MONGODB_HOST || "localhost"}:${process.env.MONGODB_PORT || "27017"}`
        const mongodb = new MongoClient(mongoUrl);
        this.db = await mongodb.connect().then(() => {
            console.log("Connected successfully to database server");
            return mongodb.db(process.env.MONGODB_DATABASE)
        })
    }

    private async configureChannels(channelsConfig: ChannelConfig[], app: ExpressApp) {
        channelsConfig
            .map(config => this.buildChannel(config, app))
            .filter(channel => channel !== null)
            .forEach(channel => this.setupChannelEventPipeline(channel))
    }

    private buildTelegramChannel(config: ChannelConfig, app: ExpressApp): Channel {
      try {
          const telegramConfig = <TelegramChannelConfig>config;
          const telegramChannel = new TelegramChannel(telegramConfig);
          telegramChannel.setWebhooks(app, { https: true, publicDomain: telegramConfig.publicDomain, endpoint: telegramConfig.endpoint });
          return telegramChannel;
      } catch (error) {
          console.error(error);
          return null;
      }
    }

    private buildFacebookMessengerChannel(config: ChannelConfig, app: ExpressApp): Channel {
        try {
            const facebookMessengerConfig = <FacebookMessengerChannelConfig>config;
            const facebookMessengerChannel = new FacebookMessengerChannel(facebookMessengerConfig);
            facebookMessengerChannel.setWebhooks(app, { https: true, publicDomain: facebookMessengerConfig.publicDomain, endpoint: facebookMessengerConfig.endpoint });
            return facebookMessengerChannel;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    private buildChannel(config: ChannelConfig, app: ExpressApp): Channel {
        switch(config.channelType) {
            case TELEGRAM:
                return this.buildTelegramChannel(config, app);
            case FACEBOOK_MESSENGER:
                return this.buildFacebookMessengerChannel(config, app);
            default:
                console.warn(`Channel ${config.channelType} not supported`);
                return null;
        }
    }

    private setupChannelEventPipeline(channel: Channel) {
        channel.on("event", event => this.processChannelEvent(channel, event));
    }

    private async processChannelEvent(channel: Channel, message: ChannelEvent) {

        console.log(message);

        try {
            if (message.type === ChannelEventType.Unknown) {
                const reply: TextReply = {
                    type: ChannelReplyType.Text,
                    text: "(ChannelEvent type not supported)",
                    quickReplies: []
                }
                channel.reply(message, reply);
                return;
            }

            if (this.isStartChannelEvent(message)) {
                const index = getRandomInteger(0, this.assistant.welcomeMessageStart.length - 1);
                const reply: TextReply = {
                    type: ChannelReplyType.Text,
                    text: this.assistant.welcomeMessageStart[index],
                    quickReplies: []
                }
                channel.reply(message, reply);
                return;
            }

            const context = await this.getContext(this.assistantId, this.environmentId, message.sourceChannel, message.user.id);

            // ChannelEvent loop detection
            if (message._loop === undefined) {
                message._loop = 0;
            } else if (message._loop > 1) {
                context.language = null;
                await this.saveContext(this.assistantId, this.environmentId, message.sourceChannel, message.user.id, context);
                throw Error("ChannelEvent loop");
            }
            message._loop++;

            if (this.assistant.detectLanguage) {
                const langDetected = await this.detectLanguage(context.currentSkillId, (<TextEvent> message).text);
                console.log("LANGUAGE DETECTED: ", langDetected);
                if (langDetected) {
                    context.language = langDetected;
                }
            }
            if (!context.language) {
                context.language = await this.chooseLanguage(context.currentSkillId, message.locale);
                if (!context.language) {
                    throw Error("No available languages");
                }
            }
            console.log("CONTEXT LANGUAGE: ", context.language);

            if (!context.currentSkillId) {
                context.currentSkillId = await this.chooseSkill((<TextEvent> message).text, context.language);

                console.log("CHOOSE SKILL: ", context.currentSkillId);

                // If no skill yet, send assistant fallback message, if no messages, throw Error
                if (!context.currentSkillId) {
                    if (!this.assistant.fallbackReplies || this.assistant.fallbackReplies.length === 0) {
                        throw Error("Assistant with no fallback replies");
                    }
                    const index = getRandomInteger(0, this.assistant.fallbackReplies.length - 1);
                    const reply: TextReply = {
                        type: ChannelReplyType.Text,
                        text: this.assistant.fallbackReplies[index],
                        quickReplies: []
                    }
                    channel.reply(message, reply);
                    return;
                }
            }

            const nluResult = await this.processNLUService(context, (<TextEvent>message).text);

            console.log("NLU RESULT", JSON.stringify(nluResult, null, 4));

            let dialogEngineOutput = await this.processDialogEngine({ channel, context, message, nluResult });

            if (dialogEngineOutput.fallback && dialogEngineOutput.fallback.changeContext) {

                const newSkillId = await this.chooseSkill((<TextEvent>message).text, context.language);

                if (newSkillId) {
                    console.log("CONTEXT CHANGE. NEW SKILL ID: ", newSkillId);

                    if (dialogEngineOutput.fallback.returnHereOnContextChangeEnd) {
                        dialogEngineOutput.context.onFlowEndReturnTo = {
                            skillId: context.currentSkillId,
                            nodeId: context.currentNodeId
                        }
                    }

                    dialogEngineOutput.context.currentNodeId = null;
                    dialogEngineOutput.context.currentSkillId = null;

                    await this.saveContext(this.assistantId, this.environmentId, message.sourceChannel, message.user.id, dialogEngineOutput.context);
                    this.processChannelEvent(channel, message);
                    return;

                } else {
                    console.log("NO CONTEXT CHANGE");
                    this.replyWithAssistantFallback(channel, message);
                }
            }

            // If flow dialog ended and return context to node, then process
            // again to send context return message if exists
            if (context.onFlowEndReturnTo && context.onFlowEndReturnTo.nodeId
                && context.onFlowEndReturnTo.skillId
                && !context.currentNodeId && !context.currentSkillId) {
                    context.currentNodeId = context.onFlowEndReturnTo.nodeId;
                    context.currentSkillId = context.onFlowEndReturnTo.skillId;
                    await sleep(500);
                    dialogEngineOutput = await this.processDialogEngine({ channel, context, message, nluResult });
            }

            this.saveContext(this.assistantId, this.environmentId, message.sourceChannel, message.user.id, dialogEngineOutput.context);

        } catch(err) {
            console.error(err);
            this.replyWithAssistantFallback(channel, message);
        }
    }

    private replyWithAssistantFallback(channel: Channel, message: ChannelEvent) {
        if (!this.assistant.fallbackReplies || this.assistant.fallbackReplies.length === 0
             || this.assistant.fallbackReplies[0].trim().length === 0) {
            const reply: TextReply = {
                type: ChannelReplyType.Text,
                text: "(An error occurred)",
                quickReplies: []
            }
            channel.reply(message, reply);
            return;
        }
        const index = getRandomInteger(0, this.assistant.fallbackReplies.length - 1);
        const reply: TextReply = {
            type: ChannelReplyType.Text,
            text: this.assistant.fallbackReplies[index],
            quickReplies: []
        }
        channel.reply(message, reply);
        return;
    }

    private async buildNLUServiceMap(assistant: Assistant, assistantActiveServices: AssistantActiveServices) {
        this.nluServiceMap = new Map();

        assistant.skillsIds.forEach(skillId => {
            const skillNLUServiceMap = new Map<string, NLUServiceCaller>();

            assistantActiveServices.skills
                .filter(skillInfo => skillInfo.skillId === skillId)
                .forEach(skillInfo => {
                    skillNLUServiceMap.set(skillInfo.language, new NLUServiceCaller({ endpoint: skillInfo.endpoint }));
                })

            this.nluServiceMap.set(skillId, skillNLUServiceMap);
        });
    }

    private async buildDialogEngineMap(assistant: Assistant) {
        this.dialogEngineMap = new Map();

        if (!assistant.skillsIds || assistant.skillsIds.length === 0) {
            return;
        }

        await assistant.skillsIds.forEach(async skillId => {
            const skillDialogMap = new Map<string, DialogEngine>();
            const multiLanguageSkill = await this.storage.getMultilanguageSkillOnlyDialog(skillId, "develop"); // TODO versions
            multiLanguageSkill.skills.forEach(skill => {
                skillDialogMap.set(skill.language, new DialogEngine(skill.dialog));
            });
            this.dialogEngineMap.set(skillId, skillDialogMap);
        })
    }

    private async processNLUService(context: Context, text: string): Promise<NLUResult> {
        const skillNLUServiceMap = this.nluServiceMap.get(context.currentSkillId);
        if (!skillNLUServiceMap) {
            throw Error(`No NLU service for current skill: ${context.currentSkillId}`);
        }

        const nluService = skillNLUServiceMap.get(context.language);
        if (!nluService) {
            throw Error(`No NLU service for language: ${context.language}`);
        }

        if (!text) {
            throw Error(`Empty text or not valid message type`);
        }

        return nluService.process(text);
    }


    private async processDialogEngine(input: DialogEngineInput): Promise<DialogEngineOutput> {
        const skillDialogEnginesMap = this.dialogEngineMap.get(input.context.currentSkillId);
        if (!skillDialogEnginesMap) {
            throw Error(`No dialog engine for current skill: ${input.context.currentSkillId}`);
        }

        const dialogEngine = skillDialogEnginesMap.get(input.context.language);
        if (!dialogEngine) {
            throw Error(`No dialog engine for language: ${input.context.language}`);
        }
        return dialogEngine.process(input);
    }

    private async getAssistantActiveServices(assistantId: string, environmentId: string): Promise<AssistantActiveServices> {
        const servicesCollection = this.db.collection("services");
        const findRes = await servicesCollection.find({ _id: `${assistantId}_${environmentId}` });
        const findResArray = await findRes.toArray();
        if (findResArray && findResArray.length < 1) {
            return null;
        }
        return findResArray[0] as AssistantActiveServices;
    }

    private async getAssistantInfo(assistantId: string, environmentId: string): Promise<Assistant> {
        const assistant = await this.storage.getAssistant(assistantId);
        const environment = await this.storage.getAssistantEnvironment(assistantId, environmentId);

        assistant.channelsConfig.forEach(channelConfig => {
            if (channelConfig.channelType === TELEGRAM) {
                const config = <TelegramChannelConfig> channelConfig;
                config.credentials.token = environment["TELEGRAM_TOKEN"];
                config.polling = environment["TELEGRAM_POLLING"] === "true" ? true : false;
                config.publicDomain = environment["TELEGRAM_PUBLIC_DOMAIN"];
                config.endpoint = environment["TELEGRAM_ENDPOINT"];
            } else if (channelConfig.channelType === FACEBOOK_MESSENGER) {
                const config = <FacebookMessengerChannelConfig> channelConfig;
                config.credentials.pageAccessToken = environment["FACEBOOK_PAGE_ACCESS_TOKEN"];
                config.credentials.verifyToken = environment["FACEBOOK_VERIFY_TOKEN"];
                config.publicDomain = environment["FACEBOOK_PUBLIC_DOMAIN"];
                config.endpoint = environment["FACEBOOK_ENDPOINT"];
            }
        })

        return assistant;
    }

    private async getContext(assistantId: string, environmentId: string, channelId: string, userId: string): Promise<Context> {
        const collection = this.db.collection("context");
        const findRes = await collection.find({ _id: `${assistantId}_${environmentId}_${channelId}_${userId}` });
        const findResArray = await findRes.toArray();
        if (findResArray && findResArray.length < 1) {
            return {
                _id: `${assistantId}_${environmentId}_${channelId}_${userId}`,
                currentSkillId: null,
                currentNodeId: null,
                language: null,        //// use default language or first language
                variables: new Map()
            };
        }
        const context = findResArray[0] as Context;
        context.variables = new Map(Object.entries(context.variables)); // Convert object to Map
        return context;
    }

    private async saveContext(assistantId: string, environmentId: string, channelId: string, userId: string, context: Context): Promise<any> {
        const collection = this.db.collection("context");
        await collection.replaceOne(
            { _id: `${assistantId}_${environmentId}_${channelId}_${userId}`},
            context,
            { upsert: true } // insert if doesnt exist
        );
    }

    private async chooseSkill(text: string, language: string): Promise<any> {
        return await Promise.all(this.assistant.skillsIds.map(async skillId => {
            const fakeContext: any = { currentSkillId: skillId, language }

            let nluResult = null;
            try {
                nluResult = await this.processNLUService(fakeContext, text);
            } catch(error) {
                console.warn("chooseSkill()", error.message);
            }

            return { skillId, nluResult };
        })).then(results => {

            console.log("CHOOSE_SKILLS_RESULTS", JSON.stringify(results, null, 4));

            // TODO check if nluResult.intent.name === null

            if (results.length === 0) {
                return null;
            }

            let bestResult = results[0];

            for (const result of results) {
                if (result.nluResult && result.nluResult.intent.name &&
                    result.nluResult.intent.probability > bestResult.nluResult.intent.probability) {
                        bestResult = result;
                }
            }

            if (bestResult)
                return bestResult.skillId;
            return null;
        });
    }

    private async chooseLanguage(currentSkillId: string, messageLocale: string): Promise<string> {

        if (currentSkillId) {
            const languages = await this.storage.listMultiLanguageSkillLanguages(currentSkillId, "develop"); // TODO skill version
            if (!languages || languages.length === 0) {
                return null;
            }
            if (languages.indexOf(messageLocale) > -1) {
                return messageLocale;
            } else {
                return languages[0];
            }
        } else {
            const langs = this.getAllSkillsLanguages();
            if (langs.length > 0) {
                return langs[0];
            } else if (messageLocale) {
                return messageLocale;
            } else {
                return null;
            }
        }
    }

    // Returns detected language if at least one skill supports it and confidence percentage is > 90
    private async detectLanguage(currentSkillId: string, text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            cld.detect(text, (err, res) => {
                if (err) {
                    return resolve(null); // Throw error?
                } else {
                    let skillsLangs = [];
                    if (currentSkillId) {
                        skillsLangs = this.getSkillLanguages(currentSkillId);
                    } else {
                        skillsLangs = this.getAllSkillsLanguages();
                    }
                    if (res.languages.length > 0 && res.languages[0].percent > 90 && skillsLangs.includes(res.languages[0].code)) {
                        return resolve(res.languages[0].code)
                    }
                    return resolve(null);
                }
            });
        });
    }

    private getAllSkillsLanguages(): string[] {
        const skillsIds = Array.from(this.dialogEngineMap.keys());
        const skillsMap = skillsIds.map(skillId => this.dialogEngineMap.get(skillId));
        const langsArrays = skillsMap.map(skillMap => Array.from(skillMap.keys()));
        return Array.from(new Set([].concat.apply([], langsArrays)));
    }

    private getSkillLanguages(skillId: string): string[] {
        if (!skillId) {
            return [];
        }
        const skillDialogMap = this.dialogEngineMap.get(skillId);
        if (!skillDialogMap) {
            return [];
        }
        return Array.from(skillDialogMap.keys());
    }

    private isStartChannelEvent(message: ChannelEvent): boolean {
        if (message.sourceChannel === TELEGRAM && (<TextEvent> message).text === "/start") {
            return true;
        }
        return false;
    }

}
