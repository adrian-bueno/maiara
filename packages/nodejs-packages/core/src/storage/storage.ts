import { Assistant } from "../assistant";
import { Environment } from "../environment";
import { Skill, MultiLanguageSkill } from "../skill";


export interface Storage {

    getAssistant(assistantId: string): Promise<Assistant>;
    getAssistantEnvironments(assistantId: string): Promise<Environment[]>;
    getAssistantEnvironment(assistantId: string, environmentId: string): Promise<Environment>;

    getAllAssistants(): Promise<Assistant[]>;
    listAssistants(): Promise<string[]>;

    saveAssistant(assistant: Assistant): Promise<any>;
    saveAssistantEnvironment(assistantId: string, environment: Environment): Promise<any>;

    listAssistantEnvironments(assistantId: string): Promise<string[]>;

    deleteAssistant(assistantId: string): Promise<any>;
    deleteAssistantEnvironment(assistantId: string, environmentId: string): Promise<any>;

    getSkill(skillId: string, version: string, language: string): Promise<Skill>;
    getSkillOnlyDialog(skillId: string, version: string, language: string): Promise<Skill>;
    getMultilanguageSkill(skillId: string, version: string): Promise<MultiLanguageSkill>;
    getMultilanguageSkillOnlyDialog(skillId: string, version: string): Promise<MultiLanguageSkill>;

    getAllSkillsInfoDevelopVersion(): Promise<Skill[]>
    // getAllSkillsInfo(): Promise<Skill[]>;

    // saveSkill(skill: Skill): Promise<any>;
    saveMultiLanguageSkill(skill: MultiLanguageSkill, version: string): Promise<any>;

    listMultiLanguageSkills(): Promise<string[]>;
    listMultiLanguageSkillVersions(skillId: string): Promise<string[]>;
    listMultiLanguageSkillLanguages(skillId: string, version: string): Promise<string[]>;

    deleteMultiLanguageSkill(skillId: string): Promise<any>;
    deleteMultiLanguageSkillVersion(skillId: string, version: string): Promise<any>;
    deleteMultiLanguageSkillLanguage(skillId: string, version: string, language: string): Promise<any>;

}
