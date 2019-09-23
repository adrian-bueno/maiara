import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Entity } from '../models';


@Component({
    selector: 'entity-editor',
    templateUrl: './entity-editor.component.html',
    styleUrls: ['./entity-editor.component.scss']
})
export class EntityEditorComponent implements OnInit {

    originalName: string;
    @Input() entity: Entity;
    @Output() entityChange = new EventEmitter<Entity>();
    @Output() entityNameChange = new EventEmitter<string>();
    @Output() valueDeleted = new EventEmitter<any>();

    @Output() newName = new EventEmitter<any>();

    entityNameRegexInvalid: string = "[^a-zA-Z0-9_]+";

    ngOnInit() {
        this.originalName = this.entity.name;
    }

    onEntityNameChange(text: string) {
        this.entityChange.emit(this.entity);
        this.entityNameChange.emit(text);
        this.newName.emit({ currentName: this.originalName, newName: text });
        this.originalName = text;
    }

    addNewEmptyValue() {
        if (!this.entity.data) {
            this.entity.data = [];
        }
        this.entity.data.push({
            value: "",
            synonyms: []
        });
        this.entityChange.emit(this.entity);
    }

    deleteValue(index: number) {
        this.valueDeleted.emit(this.entity.data[index]);
        this.entity.data.splice(index, 1);
        this.entityChange.emit(this.entity);
    }

    onValueTextChange(index:number, text: string) {
        this.entityChange.emit(this.entity);
    }

    onSynonymsTextChange(index:number, text: string) {

    }

    onSynonymsTextBlur(index:number, text: string) {
        const entitySynonyms = this.entity.data[index].synonyms;

        if (!text && entitySynonyms && entitySynonyms.length > 0) {
            this.entity.data[index].synonyms = [];
            this.entityChange.emit(this.entity);
            return;
        }

        if (text === this.synonymsToText(entitySynonyms)) {
            return;
        }

        this.entity.data[index].synonyms = text.split(",").map(text => text.trim());
        this.entityChange.emit(this.entity);
    }

    synonymsToText(synonyms: string[]) {
        return synonyms.join(", ");
    }

}
