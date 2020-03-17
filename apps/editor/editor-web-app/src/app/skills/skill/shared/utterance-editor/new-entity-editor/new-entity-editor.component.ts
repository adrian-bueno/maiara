import {
    Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit,
    OnDestroy, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';

import { UtteranceEditorService, ItemTextSelection, ItemChange } from '../utterance-editor.service';
import { UtteranceItem } from '../../models';


@Component({
    selector: 'new-entity-editor',
    templateUrl: './new-entity-editor.component.html',
    styleUrls: ['./new-entity-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewEntityEditorComponent implements OnInit, OnDestroy, OnChanges {

    @Input() active: boolean = true;
    itemTextSelection: ItemTextSelection;
    itemTextSelectionSubscription: Subscription;
    utteranceChangeSubscription: Subscription;
    itemChangeSubscription: Subscription;

    entityName: string;

    constructor(
        private cdRef: ChangeDetectorRef,
        private editorService: UtteranceEditorService) {
            // this.cdRef.detach();
    }

    ngOnInit() {
        this.itemChangeSubscription = this.editorService.onItemTextSelection$
            .subscribe((selection: ItemTextSelection) => this.onItemTextSelectionFromService(selection));
        this.utteranceChangeSubscription = this.editorService.onUtteranceChange$
            .subscribe((utterance: UtteranceItem[]) => this.onUtteranceChangeFromService(utterance));
        this.itemChangeSubscription = this.editorService.onItemChange$
            .subscribe((change: ItemChange) => this.onItemChangeFromService(change));
    }

    ngOnDestroy() {
        this.itemChangeSubscription.unsubscribe();
        this.utteranceChangeSubscription.unsubscribe();
        this.itemChangeSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.active.currentValue !== true) {
            this.itemTextSelection = undefined;
        }
    }

    private onItemTextSelectionFromService(selection: ItemTextSelection) {
        this.itemTextSelection = selection;
        this.cdRef.detectChanges();
    }

    private onUtteranceChangeFromService(utterance: UtteranceItem[]) {
        this.itemTextSelection = undefined;
        this.cdRef.detectChanges();
    }

    private onItemChangeFromService(change: ItemChange) {
        this.itemTextSelection = undefined;
        this.cdRef.detectChanges();
    }

    createEntity() {
        if (!this.entityName) return;

        this.entityName = this.entityName.trim();

        if (!this.entityName) return;

        this.editorService.createNewEntity(
            this.itemTextSelection.index,
            this.itemTextSelection.selection,
            this.entityName
        );

        this.entityName = "";
        this.cdRef.detectChanges();
    }

}
