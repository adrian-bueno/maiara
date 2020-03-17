import {
    Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

import { SendTextDialogAction } from '@app/skills/skill/shared/models';

@Component({
    selector: 'send-text-dialog-action',
    templateUrl: './send-text-dialog-action.component.html',
    styleUrls: ['./send-text-dialog-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendTextDialogActionComponent {

    @Input() action: SendTextDialogAction;
    @Output() actionChange = new EventEmitter<SendTextDialogAction>();

    constructor(private cdRef: ChangeDetectorRef) {

    }

    onSendTextChange() {
        this.actionChange.emit(this.action);
    }

    onQuickReplyTextChange() {
        this.actionChange.emit(this.action);
    }

    newEmptyQuickReply() {
        this.action.quickReplies.push("");
        this.cdRef.detectChanges();
        this.actionChange.emit(this.action);
    }

    deleteQuickReply(index: number) {
        this.action.quickReplies.splice(index, 1);
        this.cdRef.detectChanges();
        this.actionChange.emit(this.action);
    }

    customTrackByIndex(index: number, obj: any): any {
    	return index;
    }

}
