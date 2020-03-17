import { NLUResult } from "./nlu-result";


export interface NLUService {

    process(text: string): Promise<NLUResult>;

}
