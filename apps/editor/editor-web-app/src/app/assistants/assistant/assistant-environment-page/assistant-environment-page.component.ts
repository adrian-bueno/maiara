import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssistantService } from '../assistant.service';
import { Environment } from '@app/assistants/models';

@Component({
    templateUrl: './assistant-environment-page.component.html',
    styleUrls: ['./assistant-environment-page.component.scss']
})
export class AssistantEnvironmentPageComponent implements OnInit, OnDestroy {

    environmentId: string = "";
    environment: Environment;
    routerSubscription: Subscription;

    constructor(private router: Router, private route:ActivatedRoute,
        private assistantService: AssistantService) {

        this.routerSubscription = router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                this.updateEnvironment();
                if (!this.environment) {
                    this.router.navigate([`/assistants/${assistantService.assistantId}`]);
                }
            }
        });

        this.assistantService.environmentsChange$.subscribe(envs => {
            this.updateEnvironment();
            if (!this.environment) {
                this.router.navigate([`/assistants/${assistantService.assistantId}`]);
            }
        });
    }


    ngOnInit() {

    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    private updateEnvironment() {
        this.environmentId = this.route.snapshot.params["environmentId"];
        if (this.assistantService.environments) {
            this.environment = this.assistantService.environments.find(env => env.id === this.environmentId)
        }
    }

    deleteEnvironment() {
        this.assistantService.deleteEnvironment(this.environmentId);
    }

}
