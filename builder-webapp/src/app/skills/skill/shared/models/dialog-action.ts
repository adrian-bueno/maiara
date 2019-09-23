
export interface DialogAction {
    type: string;
}

export enum DialogActionType {
    SendText = "SendText",
    AssignContextVariable = "AssignContextVariable"
}

export interface SendTextDialogAction extends DialogAction {
    type: DialogActionType.SendText;
    text: string;
    quickReplies: string[];
}

export interface AssignContextVariableDialogAction extends DialogAction {
    type: DialogActionType.AssignContextVariable;
    variableName: string;
    value: number | string | boolean;
}
