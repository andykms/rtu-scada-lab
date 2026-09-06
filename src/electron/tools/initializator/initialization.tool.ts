import { EAppMode } from "../../types/settings/settings.app-mode.type";
import { ISettings } from "../../types/settings/settings.type";
import { SettingsManager } from "../settings-manager/settings-manager.tool";

export class Initializator {
  private readonly settingsManager = new SettingsManager();

  
  settings: ISettings | null = null;

  async initialize(): Promise<void> {
    this.settings = await this.settingsManager.ensureSettingsFile();
    if(this.settings.appMode === EAppMode.COMPILED) {
        //TODO
    } else {

    }
  }

  getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }
}
