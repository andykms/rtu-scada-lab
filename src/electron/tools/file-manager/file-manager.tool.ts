import { dialog } from "electron";
import * as fs from "fs/promises";
import path from "path";
import { EAppErrorCodes } from "../../classes/app-error/app-error-codes";
import { AppError } from "../../classes/app-error/app-error.class";
import { IProjectFile } from "../../types/project/project-file/project-file.type";

const SUPPORTED_PROJECT_LAB = "rtu-scada-lab_alpha";
const VERSION_0_0_1 = "0.0.1";

export class FileManager {
  async saveProjectFile(
    projectData: IProjectFile,
    options?: { forceDialog?: boolean },
  ): Promise<string | null> {
    try {
      let filePath = options?.forceDialog ? "" : (projectData.path ?? "").trim();

      if (!filePath) {
        const result = await dialog.showSaveDialog({
          title: "Сохранить проект",
          defaultPath: `${projectData.projectName || "project"}.json`,
          filters: [{ name: "Файлы проекта", extensions: ["json"] }],
        });

        if (result.canceled || !result.filePath) {
          return null;
        }

        filePath = result.filePath;
        if (path.extname(filePath).toLowerCase() !== ".json") {
          filePath = `${filePath}.json`;
        }
      }

      projectData.path = filePath;
      projectData.updatedAt = new Date().toISOString();

      await fs.writeFile(
        filePath,
        JSON.stringify(projectData, null, 2),
        "utf-8",
      );
      return filePath;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async pickProjectFilePath(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: "Открыть проект",
      filters: [{ name: "Файлы проекта", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths?.[0]) {
      return null;
    }
    return result.filePaths[0];
  }

  async openProjectFile(filePath: string): Promise<IProjectFile> {
    try {
      const stat = await fs.lstat(filePath);
      if (!stat.isFile()) {
        throw new AppError(
          "Файл проекта не валиден. По пути находится не файл",
          EAppErrorCodes.AppRuntime,
        );
      }
      if (path.extname(filePath).toLowerCase() !== ".json") {
        throw new AppError(
          "Файл проекта не валиден. Файл должен быть расширения json",
          EAppErrorCodes.AppRuntime,
        );
      }

      const raw = await fs.readFile(filePath, "utf-8");
      let jsonData: unknown;
      try {
        jsonData = JSON.parse(raw);
      } catch {
        throw new AppError(
          "Файл проекта не валиден. Некорректный JSON",
          EAppErrorCodes.AppRuntime,
        );
      }

      if (!this.isObject(jsonData)) {
        throw new AppError(
          "Файл проекта не валиден. Ожидался объект",
          EAppErrorCodes.AppRuntime,
        );
      }

      if (!this.hasBaseProjectMeta(jsonData)) {
        throw new AppError(
          "Файл проекта не валиден. Отсутствуют нужные данные",
          EAppErrorCodes.AppRuntime,
        );
      }

      const version = String(jsonData.projectLabVersion);
      switch (version) {
        case VERSION_0_0_1:
          return this.openProjectFileV001(jsonData, filePath);
        default:
          throw new AppError(
            `Неподдерживаемая версия проекта: ${version}`,
            EAppErrorCodes.AppRuntime,
          );
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Strict open/validation for project files created with lab version 0.0.1.
   */
  openProjectFileV001(
    data: Record<string, unknown>,
    filePath: string,
  ): IProjectFile {
    if (data.projectLab !== SUPPORTED_PROJECT_LAB) {
      throw new AppError(
        `Неподдерживаемый тип проекта: ${String(data.projectLab)}`,
        EAppErrorCodes.AppRuntime,
      );
    }
    if (data.projectLabVersion !== VERSION_0_0_1) {
      throw new AppError(
        `Ожидалась версия ${VERSION_0_0_1}, получено ${String(data.projectLabVersion)}`,
        EAppErrorCodes.AppRuntime,
      );
    }

    this.assertString(data, "projectName");
    this.assertNumber(data, "projectId");
    this.assertString(data, "createdAt");
    this.assertString(data, "updatedAt");
    this.assertString(data, "path");

    if (!this.isObject(data.projectData)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует projectData",
        EAppErrorCodes.AppRuntime,
      );
    }

    const projectData = data.projectData;
    if (!this.isObject(projectData.blocks)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует projectData.blocks",
        EAppErrorCodes.AppRuntime,
      );
    }

    const blocks = projectData.blocks;
    if (!Array.isArray(blocks.blockIds) || !Array.isArray(blocks.blockNames)) {
      throw new AppError(
        "Файл проекта не валиден. blockIds/blockNames должны быть массивами",
        EAppErrorCodes.AppRuntime,
      );
    }

    if (!this.isObject(blocks.networkBlocks)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует networkBlocks",
        EAppErrorCodes.AppRuntime,
      );
    }
    if (!this.isObject(blocks.internalBlocks)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует internalBlocks",
        EAppErrorCodes.AppRuntime,
      );
    }

    const networkKeys = [
      "tcpServers",
      "tcpClients",
      "mqttClients",
      "httpClients",
      "modbusRtu",
      "modbusTcp",
      "database",
      "com",
    ] as const;
    for (const key of networkKeys) {
      if (!Array.isArray(blocks.networkBlocks[key])) {
        throw new AppError(
          `Файл проекта не валиден. networkBlocks.${key} должен быть массивом`,
          EAppErrorCodes.AppRuntime,
        );
      }
    }

    const internalKeys = ["converters", "graphs", "indicators", "media"] as const;
    for (const key of internalKeys) {
      if (!Array.isArray(blocks.internalBlocks[key])) {
        throw new AppError(
          `Файл проекта не валиден. internalBlocks.${key} должен быть массивом`,
          EAppErrorCodes.AppRuntime,
        );
      }
    }

    if (!this.isObject(projectData.edges)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует edges",
        EAppErrorCodes.AppRuntime,
      );
    }
    for (const [fromKey, targets] of Object.entries(projectData.edges)) {
      if (!Array.isArray(targets) || targets.some((id) => typeof id !== "number")) {
        throw new AppError(
          `Файл проекта не валиден. edges[${fromKey}] должен быть массивом чисел`,
          EAppErrorCodes.AppRuntime,
        );
      }
    }

    if (!this.isObject(projectData.scene)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует scene",
        EAppErrorCodes.AppRuntime,
      );
    }
    if (!this.isObject(projectData.scene.nodePositions)) {
      throw new AppError(
        "Файл проекта не валиден. Отсутствует scene.nodePositions",
        EAppErrorCodes.AppRuntime,
      );
    }
    for (const [nodeId, pos] of Object.entries(projectData.scene.nodePositions)) {
      if (
        !this.isObject(pos) ||
        typeof pos.x !== "number" ||
        typeof pos.y !== "number"
      ) {
        throw new AppError(
          `Файл проекта не валиден. scene.nodePositions[${nodeId}] должен содержать x/y`,
          EAppErrorCodes.AppRuntime,
        );
      }
    }

    const project = data as unknown as IProjectFile;
    project.path = filePath;
    return project;
  }

  private hasBaseProjectMeta(data: Record<string, unknown>): boolean {
    return (
      typeof data.projectLab === "string" &&
      typeof data.projectLabVersion === "string" &&
      typeof data.projectId === "number" &&
      typeof data.projectName === "string" &&
      typeof data.createdAt === "string" &&
      typeof data.updatedAt === "string" &&
      typeof data.path === "string" &&
      data.projectData != null
    );
  }

  private assertString(data: Record<string, unknown>, key: string): void {
    if (typeof data[key] !== "string") {
      throw new AppError(
        `Файл проекта не валиден. Поле ${key} должно быть строкой`,
        EAppErrorCodes.AppRuntime,
      );
    }
  }

  private assertNumber(data: Record<string, unknown>, key: string): void {
    if (typeof data[key] !== "number") {
      throw new AppError(
        `Файл проекта не валиден. Поле ${key} должно быть числом`,
        EAppErrorCodes.AppRuntime,
      );
    }
  }

  private isObject(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
