import esprima = require('esprima');

import { NLUResult } from "../skill/nlu/nlu-result";
import { ContextVariables } from "../context";



// TODO Find better solution
// TODO if I use Function, how can I see other defined functions (e.g. isIntentInResult() )?
// Functions uses Snips objects
export function generateConditionFunction(condition: string): Function {
    if (stringContainsAFunction(condition)) {
        return () => false;
    }

    const finalCondition = replaceWithFunctions(sanitizeConditionalOperators(condition));

    if (!isValidJS(finalCondition)) {
        return () => false;
    }

    return new Function("nluResult", "contextVariables", `

        function isIntentInResult(intentName, nluResult) {
            if (nluResult.intent && nluResult.intent.name === intentName) {
                return true;
            }
            return false;
        }

        function getContextVariableValue(variableName, contextVariables) {
            return contextVariables.get(variableName);
        }

        function getEntityRawValue(entityName, nluResult) {
            if (nluResult.slots) {
                for (const slot of nluResult.slots) {
                    if (slot.entity === entityName) {
                        return slot.rawValue.trim();
                    }
                }
            }
            return null;
        }

        function getEntityWithSlotRawValue(entityName, slotName, nluResult) {
            if (nluResult.slots) {
                for (const slot of nluResult.slots) {
                    if (slot.entity === entityName && slot.name === slotName) {
                        return slot.rawValue.trim();
                    }
                }
            }
            return null;
        }

        try {
            return Boolean(${finalCondition});
        } catch(error) {
            return false;
        }
    `);
}


export function stringContainsAFunction(text: string): boolean {
    return /[a-zA-Z0-9_]+ *\(/gi.test(text);
}

export function isValidJS(text: string) {
    try {
        esprima.parseScript(text);
    }
    catch(e) {
        // console.log(e);
        return false;
    }
    return true;
}

export function sanitizeConditionalOperators(condition: string) {
    if (!condition) return null;
    return condition
        .replace(/([^=])=(?!=)/gi, " ===")     // Replace single "=" with "==="
        .replace(/([^&])&(?!&)/gi, " &&")      // Replace single "&" with "&&"
        .replace(/([^\|])\|(?!\|)/gi, " ||")   // Replace single "|" with "||"
        .replace(/={3,}/gi, "===")             // Replace more than 3 "=" with "==="
        .replace(/&{2,}/gi, "&&")              // Replace more than 2 "&" with "&&"
        .replace(/\|{2,}/gi, "||")             // Replace more than 2 "|" with "||"
}

export function replaceWithFunctions(condition: string) {
    if (!condition) return null;

    let newString: string;
    // Replace intents (#intentName) and context variables ($variableName)
    newString = condition.replace(/[#$]{1}[a-zA-Z0-9_]+/gi, matched => {
        const name = matched.substring(1);
        if (matched.startsWith("#")) {
            return `isIntentInResult("${name}", nluResult)`;
        } else if (matched.startsWith("$")) {
            return `getContextVariableValue("${name}", contextVariables)`;
        }
        return "";
    });

    // Replace entities (@entityName) and entities with slots (@entityName[slotName])
    newString = newString.replace(/@([a-zA-Z0-9_/]+)(\[[a-zA-Z0-9_]+\])?/gi, matched => {
        const names = /@([a-zA-Z0-9_/]+)(\[[a-zA-Z0-9_]+\])?/gi.exec(matched);
        let entityName: string = names[1];
        let slotName: string = names[2];

        if (slotName) {
            slotName = slotName.substring(1, slotName.length-1);
        }

        if (entityName && slotName) {
            return `getEntityWithSlotRawValue("${entityName}", "${slotName}", nluResult)`;
        } else {
            return `getEntityRawValue("${entityName}", nluResult)`;
        }
    });

    return newString;
}


export function isIntentInResult(intentName: string, nluResult: NLUResult): boolean {
    if (nluResult.intent && nluResult.intent.name === intentName) {
        return true;
    }
    return false;
}

export function isEntityInResult(entityName: string, nluResult: NLUResult): boolean {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName) {
                return true;
            }
        }
    }
    return false;
}

export function isEntityWithSlotInResult(entityName: string, slotName: string, nluResult: NLUResult): boolean {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName && slot.name === slotName) {
                return true;
            }
        }
    }
    return false;
}

export function getContextVariableValue(variableName: string, contextVariables: ContextVariables): string|number|boolean {
    const value = contextVariables.get(variableName);
    if (!value)
        return null;
    return value;
}

export function getEntityRawValue(entityName: string, nluResult: NLUResult): string {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName) {
                return slot.rawValue.trim();
            }
        }
    }
    return null;
}

export function getEntityWithSlotRawValue(entityName: string, slotName: string, nluResult: NLUResult): string {
    if (nluResult.slots) {
        for (const slot of nluResult.slots) {
            if (slot.entity === entityName && slot.name === slotName) {
                return slot.rawValue.trim();
            }
        }
    }
    return null;
}
