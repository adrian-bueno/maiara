import { DialogNode, SystemEntity, DialogActionType, SendTextDialogAction, DialogAction, Intent, Entity } from './skill/shared';
import { Skill, MultiLanguageSkill } from './skill/shared/models/skill';


export function newEmptyMultiLanguageSkill(id: string, name: string, description: string): MultiLanguageSkill {
    const multi: MultiLanguageSkill = {
        id,
        name: emptyStringIfNull(name),
        description: emptyStringIfNull(description),
        languages: [],
        skills: new Map
    }

    multi.languages.push("en");
    multi.skills.set("en", newEmptySkill(multi.id, multi.name, multi.description, "en"));

    return multi;
}

export function newEmptySkill(id: string, name: string, description: string, language: string): Skill {
    return {
        id,
        name: emptyStringIfNull(name),
        description: emptyStringIfNull(description),
        dialog: {
            nodes: [startNode()],
            edges: []
        },
        nluDataset: {
            intents: [],
            entities: [],
            systemEntities: systemEntities(),
            language
        },
        language
    }
}

// FIXME some entities doesnt work??? Snips doesnt detect some system enties as system entities???
// export function systemEntities(): SystemEntity[] {
//     return [
//         { "name": "snips/amountOfMoney", "enabled": false },
//         { "name": "snips/city",          "enabled": false },
//         { "name": "snips/country",       "enabled": false },
//         { "name": "snips/date",          "enabled": false },
//         { "name": "snips/datePeriod",    "enabled": false },
//         { "name": "snips/datetime",      "enabled": true  },
//         { "name": "snips/duration",      "enabled": false },
//         { "name": "snips/number",        "enabled": true  },
//         { "name": "snips/ordinal",       "enabled": true  },
//         { "name": "snips/percentage",    "enabled": false },
//         { "name": "snips/region",        "enabled": false },
//         { "name": "snips/temperature" ,  "enabled": false },
//         { "name": "snips/time",          "enabled": true  },
//         { "name": "snips/timePeriod",    "enabled": false }
//     ]
// }

export function systemEntities(): SystemEntity[] {
    return [
        { "name": "snips/amountOfMoney", "enabled": false },
        { "name": "snips/datetime",      "enabled": true  },
        { "name": "snips/duration",      "enabled": false },
        { "name": "snips/number",        "enabled": false },
        { "name": "snips/ordinal",       "enabled": false },
        { "name": "snips/percentage",    "enabled": false },
        { "name": "snips/temperature" ,  "enabled": false }
    ]
}

export function startNode(): DialogNode {
    return {
        id: "start",
        name: "Start",
        position: {
            "x": 130,
            "y": 190
        },
        actions: [],
        conditions: [],
        fallback: {
            changeContext: false,
            returnHereOnContextChangeEnd: false,
            onContextReturnResponse: {
                type: DialogActionType.SendText,
                text: "",
                quickReplies: []
            },
            response: {
                type: DialogActionType.SendText,
                text: "",
                quickReplies: []
            }
        }
    }
}

function emptyStringIfNull(str: string) {
    if (!str) {
        return "";
    }
    return str;
}

export function duplicateSkillAndEmptyValues(skill: Skill, newLanguage: string): Skill {
    const newSkill: Skill = JSON.parse(JSON.stringify(skill));

    newSkill.language = newLanguage;

    newSkill.dialog.nodes = newSkill.dialog.nodes.map(node => {
        const newNode: DialogNode = JSON.parse(JSON.stringify(node));
        newNode.actions = newNode.actions.map(action => {
            const newAction: DialogAction = JSON.parse(JSON.stringify(action));
            if (newAction.type === DialogActionType.SendText) {
                (<SendTextDialogAction> newAction).text = "";
                (<SendTextDialogAction> newAction).quickReplies = [];
            }
            return newAction;
        });

        if (newNode.fallback.response) {
            newNode.fallback.response.text = "";
            newNode.fallback.response.quickReplies = [];
        }

        if (newNode.fallback.onContextReturnResponse) {
            newNode.fallback.onContextReturnResponse.text = "";
            newNode.fallback.onContextReturnResponse.quickReplies = [];
        }

        return newNode;
    });

    newSkill.nluDataset.language = newLanguage;
    newSkill.nluDataset.intents = newSkill.nluDataset.intents.map(intent => {
        const newIntent: Intent = {
            name: intent.name,
            utterances: []
        }
        return newIntent;
    });
    newSkill.nluDataset.entities = newSkill.nluDataset.entities.map(entity => {
        const newEntity: Entity = {
            name: entity.name,
            data: []
        }
        return newEntity;
    });

    return newSkill;
}
