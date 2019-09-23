import {
    Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, Input
} from '@angular/core';
import { Subscription } from 'rxjs';

import { UtteranceItem } from '../../models';
import { UtteranceEditorService, ItemChange } from '../utterance-editor.service';
import { TextSelection } from '@app/shared/content-editable-text';


@Component({
    selector: 'utterance-line-editor',
    templateUrl: './utterance-line-editor.component.html',
    styleUrls: ['./utterance-line-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtteranceLineEditorComponent implements OnInit, OnDestroy {

    @Input() enableScroll: boolean = false;

    utterance: UtteranceItem[];
    utteranceChangeSubscription: Subscription;
    itemChangeSubscription: Subscription;
    deleteItemSubscription: Subscription;
    numEntities: number = 0;
    lastItemIsEntity: boolean = false;
    isEmpty: boolean = true;
    firstItemIsEntity: boolean = false;

    newItem: UtteranceItem = {
        text: ""
    }

    constructor(private editorService: UtteranceEditorService, private cdRef: ChangeDetectorRef) {
        // this.cdRef.detach();
    }

    ngOnInit() {
        this.utterance = this.editorService.getUtterance();
        this.updateFlags();
        this.cdRef.detectChanges();

        this.utteranceChangeSubscription = this.editorService.onUtteranceChange$
            .subscribe((utterance: UtteranceItem[]) => this.onUtteranceChangeFromService(utterance));
        this.itemChangeSubscription = this.editorService.onItemChange$
            .subscribe((change: ItemChange) => this.onItemChangeFromService(change));
        this.deleteItemSubscription = this.editorService.onDeleteItem$
            .subscribe((index: number) => this.onDeleteItemFromService(index));
    }

    ngOnDestroy() {
        this.utteranceChangeSubscription.unsubscribe();
        this.itemChangeSubscription.unsubscribe();
        this.deleteItemSubscription.unsubscribe();
    }

    private onDeleteItemFromService(index: number) {
        this.utterance.splice(index, 1);
        this.updateFlags();
        this.cdRef.detectChanges();
    }

    private onUtteranceChangeFromService(utterance: UtteranceItem[]) {
        this.utterance = [...utterance];
        this.updateFlags();
        this.cdRef.detectChanges();
    }

    private onItemChangeFromService(change: ItemChange) {
        if (change.sourceComponent === UtteranceLineEditorComponent.name)
            return;
        this.utterance[change.index] = change.item;
        this.updateFlags();
        this.cdRef.detectChanges();
    }

    updateFlags() {
        this.numEntities = this.editorService.getNumEntities();
        if (this.utterance.length === 0) {
            this.isEmpty = true;
            return;
        }
        this.isEmpty = false;

        if (this.utterance[this.utterance.length-1].entity) {
            this.lastItemIsEntity = true;
        } else {
            this.lastItemIsEntity = false;
        }
        if (this.utterance[0].entity) {
            this.firstItemIsEntity = true;
        } else {
            this.firstItemIsEntity = false;
        }
    }

    onItemChange(index: number, item: UtteranceItem) {
        this.editorService.itemChanged({
            sourceComponent: UtteranceLineEditorComponent.name,
            index: index,
            item: item
        });
    }

    onItemBlur(index: number, item: UtteranceItem) {
        // If empty text
        if (!item.text || !item.text.trim()) {
            this.editorService.deleteItem(index);
        }
    }

    onTextSelected(index: number, selection: TextSelection) {
        this.editorService.textSelected(index, selection);
    }

    onNewItemBlur(item: UtteranceItem) {
        if (item.text) {
            this.editorService.addNewItemAtEnd(item);
        }
    }

}
