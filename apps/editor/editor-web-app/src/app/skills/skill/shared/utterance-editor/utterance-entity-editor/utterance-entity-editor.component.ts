import {
    Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import { UtteranceItem } from '../../models';
import { UtteranceEditorService, ItemChange } from '../utterance-editor.service';


@Component({
    selector: 'utterance-entity-editor',
    templateUrl: './utterance-entity-editor.component.html',
    styleUrls: ['./utterance-entity-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UtteranceEntityEditorComponent implements OnInit, OnDestroy {

    utterance: UtteranceItem[];
    utteranceChangeSubscription: Subscription;
    itemChangeSubscription: Subscription;
    deleteItemSubscription: Subscription;
    numEntities: number = 0;

    constructor(private editorService: UtteranceEditorService, private cdRef: ChangeDetectorRef) {
        this.cdRef.detach();
    }

    ngOnInit() {
        this.utterance = this.editorService.getUtterance();
        this.numEntities = this.editorService.getNumEntities();
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

    onEnter($event: any) {
        $event.preventDefault();
    }

    private onDeleteItemFromService(index: number) {
        this.utterance.splice(index, 1);
        this.numEntities = this.editorService.getNumEntities();
        this.cdRef.detectChanges();
    }

    private onUtteranceChangeFromService(utterance: UtteranceItem[]) {
        this.utterance = [...utterance];
        this.numEntities = this.editorService.getNumEntities();
        this.cdRef.detectChanges();
    }

    private onItemChangeFromService(change: ItemChange) {
        if (change.sourceComponent === UtteranceEntityEditorComponent.name)
            return;
        this.utterance[change.index] = {
            ...this.utterance[change.index],
            ...change.item
        };
        this.numEntities = this.editorService.getNumEntities();
        this.cdRef.detectChanges();
    }

    onItemTextChange(index: number, _text: string) {
        this.editorService.itemChanged({
            sourceComponent: UtteranceEntityEditorComponent.name,
            index: index,
            item: this.utterance[index]
        });
    }

    deleteEntity($event: Event, itemIndex: number, keepItem = false) {
        $event.preventDefault();
        this.editorService.deleteItem(itemIndex, keepItem);
    }

}
