import { EAppMode } from "../../types/settings/settings.app-mode.type";
import { ISettings } from "../../types/settings/settings.type";
import { ApiEntryConstructorMode } from "../api-entry/api-entry.constructor-mode.tool";
import { FileManager } from "../file-manager/file-manager.tool";
import { ProjectConstructorManager } from "../project-constructor-manager/project-constructor-manager.tool";
import { SettingsManager } from "../settings-manager/settings-manager.tool";

export class Initializator {

  
  settings: ISettings | null = null;

  async initializeFactory(settingsManager: SettingsManager): Promise<ApiEntryConstructorMode | null> {
    this.settings = await settingsManager.ensureSettingsFile();
    if(this.settings.appMode === EAppMode.COMPILED) {
        //TODO
        return null;
    } else {
        const fileManager = new FileManager();
        const projectContructorManager = new ProjectConstructorManager();
        const apiEntryConstructorMode= new ApiEntryConstructorMode(settingsManager, fileManager, projectContructorManager);
        return apiEntryConstructorMode;
    }
  }
}
