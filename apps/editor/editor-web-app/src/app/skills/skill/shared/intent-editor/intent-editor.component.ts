import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { UtteranceItem } from '../models';


@Component({
    selector: 'intent-editor',
    templateUrl: './intent-editor.component.html',
    styleUrls: ['./intent-editor.component.scss']
})
export class IntentEditorComponent implements OnInit {

    originalName: string;
    @Input() intentName: string = "";
    @Output() intentNameChange = new EventEmitter<string>();
    @Input() utterances: UtteranceItem[][];
    @Output() utterancesChange = new EventEmitter<UtteranceItem[][]>();
    @Output() newEntityAssigned = new EventEmitter<any>();

    @Output() newName = new EventEmitter<any>();

    intentNameRegexInvalid: string = "[^a-zA-Z0-9_]+";

    ngOnInit() {
        this.originalName = this.intentName;
    }

    onIntentNameChange(text: string) {
        this.intentNameChange.emit(text);
        this.newName.emit({ currentName: this.originalName, newName: text });
        this.originalName = text;
    }

    addNewEmptyUtterance() {
        if (this.utterances === undefined) {
            this.utterances = [];
        }
        this.utterances.push([]);
        this.utterancesChange.emit(this.utterances);
    }

    deleteUtterance(index: number) {
        this.utterances.splice(index, 1);
        this.utterancesChange.emit(this.utterances);
    }

    onUtteranceChange(index: number, utterance: UtteranceItem[]) {
        this.utterances[index] = utterance;
        this.utterancesChange.emit(this.utterances);
    }

    onNewEntityAssigned($event: any): void {
        this.newEntityAssigned.emit($event);
    }

}
