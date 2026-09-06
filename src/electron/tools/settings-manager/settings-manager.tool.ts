import { app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import { IProjectFile } from "../../types/project/project-file/project-file.type";
import { EAppMode } from "../../types/settings/settings.app-mode.type";
import { ISettings } from "../../types/settings/settings.type";

/**
 * Настройки хранятся рядом с .exe (portable), а не в %APPDATA%.
 * При копировании папки скомпилированного приложения на другой ПК
 * config/settings.json переносится вместе с бинарником.
 */
export class SettingsManager {
  private static readonly SETTINGS_DIR_NAME = "config";
  private static readonly SETTINGS_FILE_NAME = "settings.json";

  getAppRootDir(): string {
    if (app.isPackaged) {
      return path.dirname(process.execPath);
    }
    return path.join(process.cwd(), "dev-runtime");
  }

  getSettingsDirPath(): string {
    return path.join(this.getAppRootDir(), SettingsManager.SETTINGS_DIR_NAME);
  }

  getSettingsFilePath(): string {
    return path.join(
      this.getSettingsDirPath(),
      SettingsManager.SETTINGS_FILE_NAME,
    );
  }

  createDefaultSettings(): ISettings {
    return {
      appMode: EAppMode.CONSTRUCTOR,
      compiledModeConfig: null,
    };
  }

  async ensureSettingsFile(): Promise<ISettings> {
    const settingsPath = this.getSettingsFilePath();
    try {
      await fs.access(settingsPath);
      return this.loadSettings();
    } catch {
      const defaults = this.createDefaultSettings();
      await this.saveSettings(defaults);
      return defaults;
    }
  }

  async loadSettings(): Promise<ISettings> {
    const settingsPath = this.getSettingsFilePath();
    try {
      const raw = await fs.readFile(settingsPath, "utf-8");
      const parsed = JSON.parse(raw) as ISettings;
      if (!this.isValidSettings(parsed)) {
        throw new Error(
          `Файл настроек невалиден: ${settingsPath}. Ожидаются поля appMode и compiledModeConfig`,
        );
      }
      return parsed;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async saveSettings(settings: ISettings): Promise<void> {
    if (!this.isValidSettings(settings)) {
      return Promise.reject(
        new Error(
          "Нельзя сохранить настройки: отсутствуют обязательные поля appMode / compiledModeConfig",
        ),
      );
    }
    const settingsDir = this.getSettingsDirPath();
    await fs.mkdir(settingsDir, { recursive: true });
    const settingsPath = this.getSettingsFilePath();
    await fs.writeFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
      "utf-8",
    );
  }

  /**
   * Запись режима скомпилированного приложения в целевую папку runtime.
   * Используется при генерации проекта в отдельное приложение.
   */
  async writeCompiledAppSettings(
    targetAppRootDir: string,
    project: IProjectFile,
  ): Promise<string> {
    const settings: ISettings = {
      appMode: EAppMode.COMPILED,
      compiledModeConfig: {
        project,
      },
    };
    const settingsDir = path.join(
      targetAppRootDir,
      SettingsManager.SETTINGS_DIR_NAME,
    );
    await fs.mkdir(settingsDir, { recursive: true });
    const settingsPath = path.join(
      settingsDir,
      SettingsManager.SETTINGS_FILE_NAME,
    );
    await fs.writeFile(
      settingsPath,
      JSON.stringify(settings, null, 2),
      "utf-8",
    );
    return settingsPath;
  }

  private isValidSettings(data: unknown): data is ISettings {
    if (!data || typeof data !== "object") {
      return false;
    }
    const settings = data as ISettings;
    if (
      settings.appMode !== EAppMode.CONSTRUCTOR &&
      settings.appMode !== EAppMode.COMPILED
    ) {
      return false;
    }
    if (settings.appMode === EAppMode.CONSTRUCTOR) {
      return settings.compiledModeConfig === null;
    }
    return (
      settings.compiledModeConfig !== null &&
      typeof settings.compiledModeConfig === "object" &&
      !!settings.compiledModeConfig.project
    );
  }
}
