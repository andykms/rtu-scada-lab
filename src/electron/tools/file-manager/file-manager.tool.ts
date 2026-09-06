import * as fs from "fs/promises";
import path from "path";
import { IProjectFile } from "../../types/project/project-file/project-file.type";


export class FileManager {

  async saveProjectFile(projectData: IProjectFile, path: string): Promise<void> {
    //TODO
  }

  async openProjectFile(filePath: string): Promise<IProjectFile> {
    try {
      const stat = await fs.lstat(filePath);
      if (!stat.isFile()) {
        throw new Error("Файл проекта не валиден. По пути находится не файл");
      }
      if (path.extname(filePath).toLocaleLowerCase() !== ".json") {
        throw new Error(
          "Файл проекта не валиден. Файл должен быть расширения json",
        );
      }
      const file = await fs.readFile(filePath);
      const rawStringData = file.toString();
      const jsonData = JSON.parse(rawStringData);
      const isProjectFile = this.checkFileProject(jsonData);
      if (!isProjectFile) {
        throw new Error("Файл проекта не валиден. Отсутствуют нужные даные");
      }
      return jsonData as IProjectFile;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private checkFileProject(data: any): boolean {
    return (
      typeof data.projectLab == "string" &&
      typeof data.projectLabVersion == "string" &&
      typeof data.projectId == "number" &&
      typeof data.projectName == "string" &&
      typeof data.createdAt == "string" &&
      typeof data.updatedAt == "string" &&
      typeof data.path == "string" &&
      data.projectData
    );
  }
}
