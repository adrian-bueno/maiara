import {
    Component, ChangeDetectionStrategy, OnInit, Input, Output, OnDestroy,
    HostListener, ElementRef, EventEmitter
} from '@angular/core';
import { Subscription } from 'rxjs';

import { UtteranceItem } from '../models';
import { UtteranceEditorService } from './utterance-editor.service';

@Component({
    selector: 'utterance-editor',
    templateUrl: './utterance-editor.component.html',
    styleUrls: ['./utterance-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [UtteranceEditorService]
})
export class UtteranceEditorComponent implements OnInit, OnDestroy {

    @Input() utterance: UtteranceItem[];
    @Output() utteranceChange = new EventEmitter<UtteranceItem[]>();
    @Output() newEntityAssigned = new EventEmitter<any>();

    utteranceChangeSubscription: Subscription;
    newEntityAssignedSubscription: Subscription;
    isActive: boolean = false;


    constructor(private elemRef: ElementRef, private editorService: UtteranceEditorService) {

    }

    ngOnInit() {
        if (this.utterance) {
            this.utterance = this.utterance.filter(item => item.text && item.text.trim());
        }

        this.editorService.init(this.utterance);

        this.newEntityAssignedSubscription = this.editorService.onNewEntityAssigned$.subscribe(res => {
            this.newEntityAssigned.emit(res);
        });

        this.utteranceChangeSubscription = this.editorService.onUtteranceChange$
            .subscribe((utterance: UtteranceItem[]) => this.onUtteranceChangeFromService(utterance));
    }

    ngOnDestroy() {
        this.utteranceChangeSubscription.unsubscribe();
        this.newEntityAssignedSubscription.unsubscribe();
    }

    onUtteranceEditorClick() {
        this.isActive = true;
    }

    @HostListener("document:click", ["$event"])
    onClickOut($event: MouseEvent) {
        if (this.isActive) {
            if (!this.elemRef.nativeElement.contains($event.target)) {
                this.isActive = false;
            }
        }
    }

    private onUtteranceChangeFromService(utterance: UtteranceItem[]) {
        this.utterance = utterance;
        this.utteranceChange.emit(this.utterance);
    }

    print() {
        this.editorService.print();
    }

}
