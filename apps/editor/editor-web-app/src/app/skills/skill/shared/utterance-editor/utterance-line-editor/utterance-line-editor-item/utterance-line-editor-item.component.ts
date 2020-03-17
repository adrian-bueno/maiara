import {
    Component, Input, ChangeDetectionStrategy, Output, EventEmitter
} from '@angular/core';

import { UtteranceItem } from '../../../models';
import { TextSelection } from '@app/shared/content-editable-text';


@Component({
    selector: 'utterance-line-editor-item',
    templateUrl: './utterance-line-editor-item.component.html',
    styleUrls: ['./utterance-line-editor-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtteranceLineEditorItemComponent {

    @Input() item: UtteranceItem;
    @Output() itemChange = new EventEmitter<UtteranceItem>();
    @Output() itemBlur = new EventEmitter<UtteranceItem>();
    @Output() textSelected = new EventEmitter<TextSelection>();

    @Input() isFirst: boolean;
    @Input() isLast: boolean;


    onItemTextChange(_text: string) {
        this.itemChange.emit(this.item);
    }

    onBlur(_text: string) {
        this.itemBlur.emit(this.item);
    }

    onTextSelected(selection: TextSelection) {
        this.textSelected.emit(selection);
    }

}
