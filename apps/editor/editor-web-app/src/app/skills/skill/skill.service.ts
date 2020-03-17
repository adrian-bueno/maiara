import { Injectable, EventEmitter } from '@angular/core';
import { BuilderService } from '@app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiLanguageSkill } from './shared/models/skill';
import {
    DialogEdge, DialogNode, DialogAction, DialogCondition, DialogActionType, Entity, DialogFallback
} from './shared/models';


@Injectable()
export class SkillService {

    skillId: string;

    multiLanguageSkill: MultiLanguageSkill;
    multiLanguageSkillChange$ = new EventEmitter<MultiLanguageSkill>();
    activeLanguage: string;
    activeLanguageChange$ = new EventEmitter<string>();

    constructor(private builderService: BuilderService,
        private route: ActivatedRoute, private router: Router) {

        this.skillId = this.route.snapshot.params["skillId"];

        this.builderService.getMultiLanguageSkill(this.skillId)
            .then(multiLanguageSkill => {
                this.multiLanguageSkill = multiLanguageSkill;
                if (this.multiLanguageSkill.skills && this.multiLanguageSkill.skills.size > 0) {
                    this.activeLanguage = this.multiLanguageSkill.skills.keys().next().value;
                    this.activeLanguageChange$.emit(this.activeLanguage);
                }
                this.multiLanguageSkillChange$.emit(this.multiLanguageSkill);
            })
            .catch(error => {
                this.router.navigate(["/skills"]);
                console.error(error);
            });
    }

    changeActiveLanguage(languageCode: string) {
        this.activeLanguage = languageCode;
        this.activeLanguageChange$.emit(this.activeLanguage);
    }

    private getLanguagesExceptActive(): string[] {
        if (!this.multiLanguageSkill) {
            return [];
        }
        return this.multiLanguageSkill.languages.filter(lang => lang != this.activeLanguage);
    }

    // private forEachNotActiveLanguage() {
    //     const langs = this.getLanguagesExceptActive();
    //     langs.forEach(lang => {
    //         const skill = this.multiLanguageSkill.skills.get(lang);
    //         // ...
    //     });
    // }

    async saveChanges(): Promise<any> {
        return this.builderService.saveMultiLanguageSkill(this.multiLanguageSkill, "develop");
    }


    addNodeNotActiveDialogs(node: DialogNode) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            skill.dialog.nodes.push(JSON.parse(JSON.stringify(node)));
        });
    }

    updateNodeNameAndPositionNotActiveDialogs(node: DialogNode) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const n = skill.dialog.nodes.find(n => n.id == node.id);
            n.name = node.name;
            n.position.x = node.position.x;
            n.position.y = node.position.y;
        });
    }

    deleteNodeNotActiveDialogs(nodeId: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const nodeIndex = skill.dialog.nodes.findIndex(node => node.id == nodeId);
            const node = skill.dialog.nodes[nodeIndex];
            node.conditions.forEach((condition, index) => {
                if (condition.goToNode) {
                    const edgeIndex = skill.dialog.edges
                        .findIndex(e => e.start.nodeId === node.id && e.start.conditionIndex === index);
                    skill.dialog.edges.splice(edgeIndex, 1);
                }
            });
            skill.dialog.nodes.splice(nodeIndex, 1);
        });

        // FIXME remove input edge if exists
    }

    addNodeActionNotActiveDialogs(nodeId: string, action: DialogAction) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.actions.push(JSON.parse(JSON.stringify(action)));
        });
    }

    updateNodeActionNotActiveDialogs(nodeId: string, actionIndex: number, action: DialogAction) {
        if (action.type === DialogActionType.SendText) {
            return;
        }

        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.actions[actionIndex] = JSON.parse(JSON.stringify(action));
        });
    }

    deleteNodeActionNotActiveDialogs(nodeId: string, actionIndex: number) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.actions.splice(actionIndex, 1);
        });
    }

    addNodeConditionNotActiveDialogs(nodeId: string, condition: DialogCondition) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.conditions.push(JSON.parse(JSON.stringify(condition)));
        });
    }

    updateNodeConditionTextNotActiveDialogs(nodeId: string, conditionIndex: number, text: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.conditions[conditionIndex].text = text;
        });
    }

    deleteNodeContidionNotActiveDialogs(nodeId: string, conditionIndex: number) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(node => node.id == nodeId);
            node.conditions.splice(conditionIndex, 1);
            const edgeIndex = skill.dialog.edges.findIndex(edge => edge.start.nodeId == nodeId && edge.start.conditionIndex === conditionIndex);
            if (edgeIndex > -1) {
                skill.dialog.edges.splice(edgeIndex, 1);
            }
        });
    }

    addEdge(edge: DialogEdge) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const startNode = skill.dialog.nodes.find(node => node.id === edge.start.nodeId);
            if (startNode.conditions[edge.start.conditionIndex].goToNode) {
                const currentEdge = skill.dialog.edges
                    .find(e => e.start.nodeId === edge.start.nodeId &&
                               e.start.conditionIndex === edge.start.conditionIndex);
                this.deleteEdge(currentEdge);
            }
            startNode.conditions[edge.start.conditionIndex].goToNode = edge.end.nodeId;
            skill.dialog.edges.push(edge);
        });
    }

    deleteEdge(edge: DialogEdge) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const edgeIndex = skill.dialog.edges.findIndex(e => {
                return e.start.conditionIndex === edge.start.conditionIndex &&
                       e.start.nodeId === edge.start.nodeId &&
                       e.end.nodeId === edge.end.nodeId;
            });
            skill.dialog.edges.splice(edgeIndex, 1);

            const startNode = skill.dialog.nodes.find(node => node.id === edge.start.nodeId);
            startNode.conditions[edge.start.conditionIndex].goToNode = null;
        });
    }

    updateEdgesNotActiveDialogs(edges: DialogEdge[]) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            skill.dialog.edges = edges;
        });
    }

    updateFallbackBooleansNotActiveDialogs(nodeId: string, fallback: DialogFallback) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const node = skill.dialog.nodes.find(n => n.id === nodeId);
            if (node) {
                node.fallback.changeContext = fallback.changeContext;
                node.fallback.returnHereOnContextChangeEnd = fallback.returnHereOnContextChangeEnd;
            }
        });
    }

    changeIntentNameNotActiveDatasets(currentName: string, newName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const intent = skill.nluDataset.intents.find(intent => intent.name === currentName);
            if (intent) {
                intent.name = newName;
            }
        });
    }

    changeEntityNameNotActiveDatasets(currentName: string, newName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const entity = skill.nluDataset.entities.find(entity => entity.name === currentName);
            if (entity) {
                entity.name = newName;
            }
        });
    }

    addIntentNotActiveDatasets(intentName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            langs.forEach(lang => {
                const skill = this.multiLanguageSkill.skills.get(lang);
                skill.nluDataset.intents.push({
                    name: intentName,
                    utterances: []
                })
            });
        });
    }

    addEntityNotActiveDatasets(entityName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            skill.nluDataset.entities.push({
                name: entityName,
                data: []
            });
        });
    }

    deleteIntentNotActiveDatasets(intentName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const index = skill.nluDataset.intents.findIndex(intent => intent.name === intentName);
            skill.nluDataset.intents.splice(index, 1);
        });
    }

    deleteEntityNotActiveDatasets(entityName: string) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const index = skill.nluDataset.entities.findIndex(entity => entity.name === entityName);
            skill.nluDataset.entities.splice(index, 1);
        });
    }

    updateSystemEntityNotActiveDatasets(entityName: string, enabled: boolean) {
        const langs = this.getLanguagesExceptActive();
        langs.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const systemEntity = skill.nluDataset.systemEntities.find(systemEntity => systemEntity.name == entityName);
            systemEntity.enabled = enabled;
        });
    }

    deleteMultiLanguageSkill() {
        this.builderService.deleteMultiLanguageSkill(this.skillId)
            .then(() => {
                this.router.navigate(["/skills"]);
                window.scroll(0,0);
            })
            .catch(error => {
                console.error(error);
            })
    }

    onNewEntityAssigned(event) {
        this.multiLanguageSkill.languages.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            const systemEntity = skill.nluDataset.systemEntities.find(systemEntity => systemEntity.name === event.entityName);
            if (systemEntity) {
                return;
            }
            const entity = skill.nluDataset.entities.find(entity => entity.name === event.entityName);
            if (entity) {

                const entityValue = entity.data.find(data => data.value === event.text);
                if (entityValue) {
                    return;
                }

                entity.data.push({
                    value: event.text,
                    synonyms: []
                });
                return;
            }

            const newEntity: Entity = {
                name: event.entityName,
                data: [{
                    value: event.text,
                    synonyms: []
                }]
            }
            skill.nluDataset.entities.push(newEntity);
        });
    }

    onEntityDeletedUpdateUtterances(entityName: string, value?: string) {
        this.deleteEntityFromUtterances(entityName, value);
        this.multiLanguageSkillChange$.emit(this.multiLanguageSkill);
    }


    private deleteEntityFromUtterances(entityName: string, value: string) {
        this.multiLanguageSkill.languages.forEach(lang => {
            const skill = this.multiLanguageSkill.skills.get(lang);
            skill.nluDataset.intents.forEach(intent => {
                intent.utterances.forEach(utterance => {
                    let indexes = [];
                    let i = 0;
                    for (const item of utterance) {
                        if (value && item.text !== value) {  // TODO synonyms
                            i++;
                            continue;
                        }
                        if (item.entity === entityName) {
                            indexes.push(i);
                        }
                        i++;
                    }
                    indexes = indexes.sort().reverse();
                    indexes.forEach(index => {
                        // If previous and next items are not entities
                        if ((index > 0 && !utterance[index-1].entity) && (index+1 < utterance.length && !utterance[index+1].entity)) {
                            utterance[index-1].text += " " + utterance[index].text + " " + utterance[index+1].text;
                            utterance.splice(index+1, 1);
                            utterance.splice(index, 1);
                        // If previous item is not an entity
                        } else if (index > 0 && !utterance[index-1].entity) {
                            utterance[index-1].text += " " + utterance[index].text;
                            utterance.splice(index, 1);
                        // If next is item is not an entity
                        } else if (index+1 < utterance.length && !utterance[index+1].entity) {
                            utterance[index+1].text = utterance[index].text + " " + utterance[index+1].text;
                            utterance.splice(index, 1);
                        // If previous item is an entity
                        } else {
                            utterance[index] = { text: utterance[index].text };
                        }
                    });
                });
            });
        });
    }

}
