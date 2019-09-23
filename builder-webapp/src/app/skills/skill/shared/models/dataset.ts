import { Intent } from './intent';
import { Entity, SystemEntity } from './entity';


export interface SkillDataset {
    language: string;
    intents: Intent[];
    entities: Entity[];
    systemEntities: SystemEntity[];
}
