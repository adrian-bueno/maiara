import {
    Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';

import { AssignContextVariableDialogAction } from '@app/skills/skill/shared/models';

@Component({
    selector: 'assign-context-variable-dialog-action',
    templateUrl: './assign-context-variable-dialog-action.component.html',
    styleUrls: ['./assign-context-variable-dialog-action.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignContextVariableDialogActionComponent {

    @Input() action: AssignContextVariableDialogAction;
    @Output() actionChange = new EventEmitter<AssignContextVariableDialogAction>();

    onChange() {
        this.actionChange.emit(this.action);
    }

}
