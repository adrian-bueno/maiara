import { NLUService, NLUResult, SnipsNLUResult, NLUSlotResult } from '@maiara/core';
import axios = require('axios');


export interface NLUServiceCallerConfig {
    endpoint: string;
}

export class NLUServiceCaller implements NLUService {

    private endpoint: string;

    constructor(config: NLUServiceCallerConfig) {
        this.endpoint = config.endpoint;
    }

    async process(text: string): Promise<NLUResult> {
        return axios.default.post(this.endpoint, { text })
                .then(res => this.mapToNLUResult(res.data));
    }

    private mapToNLUResult(snipsResult: SnipsNLUResult): NLUResult {
        if (!snipsResult) {
            return null;
        }
        return {
            input: snipsResult.input,
            intent: {
                name: snipsResult.intent.intentName,
                probability: snipsResult.intent.probability,
            },
            slots: snipsResult.slots.map(slot => {
                const nluSlot: NLUSlotResult = {
                    name: slot.name,
                    entity: slot.entity,
                    rawValue: slot.rawValue,
                    value: slot.value,
                    start: slot.range.start,
                    end: slot.range.end
                }
                return nluSlot;
            })
        }
    }

}
