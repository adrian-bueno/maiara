import { DialogAction, SendTextDialogAction } from './dialog-action';


export interface Dialog {
    nodes: DialogNode[];
    edges?: DialogEdge[];
}

export interface DialogNode {
    id: string;
    name: string;
    position: DialogPoint;
    actions: DialogAction[];
    conditions: DialogCondition[];
    fallback: DialogFallback;
}

export interface DialogPoint {
    x: number;
    y:number;
}

export interface DialogCondition {
    text: string;
    goToNode?: string;
}

export interface DialogEdgeStart {
    nodeId: string;
    conditionIndex?: number;
    position: DialogPoint;
}
export interface DialogEdgeEnd {
    nodeId: string;
    position: DialogPoint;
}

export interface DialogEdge {
    start: DialogEdgeStart;
    end: DialogEdgeEnd;
}

export interface DialogFallback {
    response?: SendTextDialogAction;
    changeContext?: boolean;
    returnHereOnContextChangeEnd?: boolean;
    onContextReturnResponse?: SendTextDialogAction;
}
