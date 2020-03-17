import { Component, Input, Output, EventEmitter } from '@angular/core';

import { EntityData } from '../../models';


@Component({
    selector: 'entity-data-editor',
    templateUrl: './entity-data-editor.component.html',
    styleUrls: ['./entity-data-editor.component.scss']
})
export class EntityDataEditorComponent {

    @Input() data: EntityData;
    @Output() dataChange = new EventEmitter<EntityData>();



}
