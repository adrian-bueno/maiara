import { NLUResult } from "../skill/nlu/nlu-result";
import { ContextVariables } from "../context";


export function parseStringWithValues(text: string, nluResult: NLUResult, contextVariables: ContextVariables) {
    if (!text) {
        return "";
    }

    let newString: string;
    // Replace context variables ($variableName)
    newString = text.replace(/\{\{ *[#$]{1}[a-zA-Z0-9_]+ *\}\}/gi, matched => {
        const name = /[#$]{1}([a-zA-Z0-9_]+)/gi.exec(matched);
        if (name.length === 2) {
            return getContextVariableValue(name[1], contextVariables);
        }
        return matched;
    });

    // Replace entities (@entityName) and entities with slots (@entityName[slotName])
    newString = newString.replace(/\{\{ *@([a-zA-Z0-9_/]+)(\[[a-zA-Z0-9_]+\])? *\}\}/gi, matched => {
        const names = /@([a-zA-Z0-9_/]+)(\[[a-zA-Z0-9_]+\])?/gi.exec(matched);
        let entityName: string = names[1];
        let slotName: string = names[2];

        if (slotName) {
            slotName = slotName.substring(1, slotName.length-1);
        }

        if (entityName && slotName) {
            return getEntityWithSlotRawValue(entityName, slotName, nluResult);
        } else {
            return getEntityRawValue(entityName, nluResult);
        }
    });

    return newString;
}


function getContextVariableValue(variableName: string, contextVariables: ContextVariables): string {
    const value = contextVariables.get(variableName);
    if (!value)
        return "";
    return String(value);
}

function getEntityRawValue(entityName: string, nluResult: NLUResult): string {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName) {
                return slot.rawValue.trim();
            }
        }
    }
    return "";
}

function getEntityWithSlotRawValue(entityName: string, slotName: string, nluResult: NLUResult): string {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName && slot.name === slotName) {
                return slot.rawValue.trim();
            }
        }
    }
    return "";
}
