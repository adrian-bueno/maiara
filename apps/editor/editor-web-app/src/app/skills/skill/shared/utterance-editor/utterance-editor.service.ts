import { Injectable, Output, EventEmitter } from '@angular/core';

import { UtteranceItem } from '../models';
import { TextSelection } from '@app/shared/content-editable-text';


export interface ItemChange {
    sourceComponent: string;
    index: number;
    item: UtteranceItem;
}

export interface ItemTextSelection {
    index: number;
    selection: TextSelection
}

@Injectable()
export class UtteranceEditorService {

    private utterance: UtteranceItem[];

    @Output() onUtteranceChange$ = new EventEmitter<UtteranceItem[]>();
    @Output() onItemChange$ = new EventEmitter<ItemChange>();
    @Output() onDeleteItem$ = new EventEmitter<number>();
    @Output() onItemTextSelection$ = new EventEmitter<ItemTextSelection>();

    @Output() onNewEntityAssigned$ = new EventEmitter<any>();
    @Output() onEntityDeleted$ = new EventEmitter<string>();


    init(utterance: UtteranceItem[]) {
        this.utterance = utterance;
    }

    getUtterance(): UtteranceItem[] {
        return [...this.utterance];
    }

    getNumEntities(): number {
        return this.utterance.filter(item => item.entity).length;
    }

    print() {
        console.log(this.utterance);
    }

    itemChanged(change: ItemChange) {
        // console.log(change);
        let newItem = { ...change.item };
        this.utterance[change.index] = newItem;
        this.onItemChange$.emit(Object.assign(change, { item: newItem }));
    }

    textSelected(index: number, selection: TextSelection) {
        if (this.utterance[index].entity) {
            return;
        }
        this.onItemTextSelection$.emit({ index, selection });
    }

    addNewItemAtEnd(item: UtteranceItem) {
        this.utterance.push(item);
        this.onUtteranceChange$.emit(this.utterance);
    }

    addNewItemAtStart(item: UtteranceItem) {
        this.utterance.unshift(item);
        this.onUtteranceChange$.emit(this.utterance);
    }

    createNewEntity(index: number, selection: TextSelection, entityName: string) {
        if (this.utterance[index].entity) {
            return;
        }

        let item = this.utterance[index];

        let replaceItems = [];

        if (selection.start > 0) {
            let text = item.text.substring(0, selection.start).trim();
            replaceItems.push({ text });
        }

        replaceItems.push({ text: selection.text, entity: entityName });

        if (selection.end < item.text.length) {
            let text = item.text.substring(selection.end).trim();
            replaceItems.push({ text });
        }

        this.utterance.splice(index, 1, ...replaceItems);

        this.onUtteranceChange$.emit(this.utterance);

        this.onNewEntityAssigned$.emit({ entityName, text: selection.text });
    }

    deleteItem(index: number, keepItem = false) {
        if (index < 0 || index > this.utterance.length)
            return;

        if (keepItem) {
            // If previous and next items are not an entities
            if ((index > 0 && !this.utterance[index-1].entity) && (index+1 < this.utterance.length && !this.utterance[index+1].entity)) {
                this.utterance[index-1].text += " " + this.utterance[index].text + " " + this.utterance[index+1].text;
                this.onItemChange$.emit({
                    sourceComponent: UtteranceEditorService.name,
                    index: index-1,
                    item: { text: this.utterance[index-1].text }
                });
                this.utterance.splice(index+1, 1);
                this.onDeleteItem$.emit(index+1);
                this.utterance.splice(index, 1);
                this.onDeleteItem$.emit(index);
            // If previous item is not an entity
            } else if (index > 0 && !this.utterance[index-1].entity) {
                this.utterance[index-1].text += " " + this.utterance[index].text;
                this.onItemChange$.emit({
                    sourceComponent: UtteranceEditorService.name,
                    index: index-1,
                    item: { text: this.utterance[index-1].text }
                });
                this.utterance.splice(index, 1);
                this.onDeleteItem$.emit(index);
            // If next is item is not an entity
            } else if (index+1 < this.utterance.length && !this.utterance[index+1].entity) {
                this.utterance[index+1].text = this.utterance[index].text + " " + this.utterance[index+1].text;
                this.onItemChange$.emit({
                    sourceComponent: UtteranceEditorService.name,
                    index: index+1,
                    item: { text: this.utterance[index+1].text }
                });
                this.utterance.splice(index, 1);
                this.onDeleteItem$.emit(index);
            // If previous item is an entity
            } else {
                this.utterance[index] = { text: this.utterance[index].text };
                this.onItemChange$.emit({
                    sourceComponent: UtteranceEditorService.name,
                    index: index,
                    item: { text: this.utterance[index].text }
                });
            }
        } else {
            // If previous and next items are not an entities
            if ((index > 0 && !this.utterance[index-1].entity) && (index+1 < this.utterance.length && !this.utterance[index+1].entity)) {
                this.utterance[index-1].text += " " + this.utterance[index+1].text;
                this.onItemChange$.emit({
                    sourceComponent: UtteranceEditorService.name,
                    index: index-1,
                    item: { text: this.utterance[index-1].text }
                });
                this.utterance.splice(index+1, 1);
                this.onDeleteItem$.emit(index+1);
            }
            this.utterance.splice(index, 1);
            this.onDeleteItem$.emit(index);
        }
        this.onUtteranceChange$.emit(this.utterance);
    }

}
