import { ChannelConfig } from "../channel";


export interface Assistant {
    id: string;
    name: string;
    description?: string;
    channelsConfig?: ChannelConfig[];
    skillsIds?: string[];                // Versions ???
    welcomeMessageStart?: string[];
    fallbackReplies?: string[];
    detectLanguage?: boolean;
    defaultLanguage?: string;
}
