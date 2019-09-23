
export enum ReplyType {
    Text = "Text"
}

export interface Reply {
    type: ReplyType;
}

export interface TextReply extends Reply {
    type: ReplyType.Text;
    text: string;
    quickReplies: string[];
}
