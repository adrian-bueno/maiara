import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SystemEntity } from '../models';


@Component({
    selector: 'system-entities-editor',
    templateUrl: './system-entities-editor.component.html',
    styleUrls: ['./system-entities-editor.component.scss']
})
export class SystemEntitiesEditorComponent {

    @Input() systemEntities: SystemEntity[];
    @Output() systemEntitiesChange = new EventEmitter<SystemEntity[]>();
    @Output() systemEntityChange = new EventEmitter<SystemEntity>();

    itemChange(index: number) {
        this.systemEntityChange.emit(this.systemEntities[index]);
    }

}
