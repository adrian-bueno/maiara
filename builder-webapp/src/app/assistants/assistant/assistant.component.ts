import { Component } from '@angular/core';
import { AssistantService } from './assistant.service';


@Component({
    templateUrl: './assistant.component.html',
    styleUrls: ['./assistant.component.scss'],
    providers: [AssistantService]
})
export class AssistantComponent {



    constructor(private assistantService: AssistantService) {



    }




}
