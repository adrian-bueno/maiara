import { ChannelConfig } from './channels';

export interface Assistant {
    id: string;
    name: string;
    description?: string;
    channelsConfig?: ChannelConfig[];
    skillsIds?: string[];
    welcomeMessageStart?: string[];
    fallbackReplies?: string[];
    detectLanguage?: boolean;
    defaultLanguage?: string;
}
