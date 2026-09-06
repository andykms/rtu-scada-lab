import { IProjectFile } from "../project/project-file/project-file.type";
import { EAppMode } from "./settings.app-mode.type";

export interface ISettings {
    appMode: EAppMode;
    compiledModeConfig: ISettingsCompiledModeConfig | null;
}

export interface ISettingsCompiledModeConfig {
    project: IProjectFile;
}