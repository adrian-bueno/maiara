import { Component } from '@angular/core';
import { SkillService } from './skill.service';

@Component({
    templateUrl: './skill.component.html',
    styleUrls: ['./skill.component.scss'],
    providers: [SkillService]
})
export class SkillComponent {

    constructor(private skillService: SkillService) {
        
    }

}
