import {
    Component, Input, Output, EventEmitter,
    ChangeDetectorRef, ChangeDetectionStrategy, OnInit
} from '@angular/core';

import {
    DialogNode, DialogActionType,
    SendTextDialogAction, AssignContextVariableDialogAction, DialogAction
} from '../../models';


@Component({
    selector: 'node-editor',
    templateUrl: './node-editor.component.html',
    styleUrls: ['./node-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeEditorComponent implements OnInit {

    @Input() node: DialogNode;
    @Output() nodeChange = new EventEmitter<DialogNode>();

    @Output() nameChanged = new EventEmitter<string>();

    @Output() actionAdded = new EventEmitter<any>();
    @Output() actionChanged = new EventEmitter<any>();
    @Output() actionDeleted = new EventEmitter<number>();

    @Output() conditionAdded = new EventEmitter<any>();
    @Output() conditionTextChanged = new EventEmitter<any>();
    @Output() conditionDeleted = new EventEmitter<any>();

    @Output() fallbackChanged = new EventEmitter<any>();

    isLeaf: boolean = false;

    constructor(private cdRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.updateIsLeaf();
    }

    updateIsLeaf() {
        if (this.node && this.node.conditions) {
            for (const condition of this.node.conditions) {
                if (condition.goToNode && condition.text) {
                    this.isLeaf = false;
                    return;
                }
            }
        }
        this.isLeaf = true;
    }

    onNodeNameChange(text: string) {
        this.cdRef.detectChanges();
        this.nodeChange.emit(this.node);
        this.nameChanged.emit(this.node.name);
    }

    newEmptySendTextAction() {
        const newAction: SendTextDialogAction = {
            type: DialogActionType.SendText,
            text: "",
            quickReplies: []
        };
        this.node.actions.push(newAction);
        this.actionAdded.emit(newAction);
        this.nodeChange.emit(this.node);
        this.cdRef.detectChanges();
    }

    newEmptyAssignContextVariableAction() {
        const newAction: AssignContextVariableDialogAction = {
            type: DialogActionType.AssignContextVariable,
            variableName: "",
            value: undefined
        };
        this.node.actions.push(newAction);
        this.actionAdded.emit(newAction);
        this.nodeChange.emit(this.node);
        this.cdRef.detectChanges();
    }

    onActionChange(index: number, action: DialogAction) {
        this.actionChanged.emit({ index, action });
    }

    deleteAction(index: number) {
        this.node.actions.splice(index, 1);
        this.actionDeleted.emit(index);
        this.nodeChange.emit(this.node);
        this.cdRef.detectChanges();
    }

    newEmptyCondition() {
        const newCondition = {
            text: "",
            goToNode: undefined
        };
        this.node.conditions.push(newCondition);
        this.nodeChange.emit(this.node);
        this.updateIsLeaf();
        this.cdRef.detectChanges();
        this.conditionAdded.emit(newCondition);
    }

    onConditionTextChange(index: number, text: string) {
        this.nodeChange.emit(this.node);
        this.conditionTextChanged.emit({ index, text });
        this.updateIsLeaf();
        this.cdRef.detectChanges();
    }

    deleteCondition(index, condition) {
        this.node.conditions.splice(index, 1);
        this.conditionDeleted.emit({ index, condition });
        this.nodeChange.emit(this.node);
        this.updateIsLeaf();
        this.cdRef.detectChanges();
    }

    fallbackChange() {
        this.fallbackChanged.emit(this.node.fallback);
        this.cdRef.detectChanges();
    }

}
