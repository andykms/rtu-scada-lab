import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import type { IConverterBlock } from "../../../../electron/types/blocks/internal-blocks/converter/converter.type";
import type { IGraphBlock } from "../../../../electron/types/blocks/internal-blocks/graphs/graphs.type";
import type { IIndicatorsBlock } from "../../../../electron/types/blocks/internal-blocks/indicators/indicators.type";
import type { IMediaBlock } from "../../../../electron/types/blocks/internal-blocks/media/media.type";
import type { IComBlock } from "../../../../electron/types/blocks/network-blocks/com/com.type";
import type { IDatabaseBlock } from "../../../../electron/types/blocks/network-blocks/database/database.type";
import type { IHttpClientBlock } from "../../../../electron/types/blocks/network-blocks/http-client/http-client.type";
import type { IModbusRtuBlock } from "../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type";
import type { IModbusTcpBlock } from "../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type";
import type { IMqttClientBlock } from "../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import type { ITcpClientBlock } from "../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type";
import type { ITcpServerBlock } from "../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type";
import type { IProjectFile } from "../../../../electron/types/project/project-file/project-file.type";
import type { EAppMode } from "../../../../electron/types/settings/settings.app-mode.type";

@Injectable({
  providedIn: "root",
})
export class ElectronAPIService {
  getAppMode(): Observable<EAppMode> {
    return from(window.electronAPI.getAppMode());
  }

  openProjectFile(filePath: string): Observable<IProjectFile> {
    return from(window.electronAPI.openProjectFile(filePath));
  }

  createProject(projectName: string): Observable<IProjectFile> {
    return from(window.electronAPI.createProject(projectName));
  }

  setTcpServerBlock(
    projectId: number,
    data: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setTcpServerBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setTcpClientBlock(
    projectId: number,
    data: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setTcpClientBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setMqttClientBlock(
    projectId: number,
    data: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setMqttClientBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setModbusRtuBlock(
    projectId: number,
    data: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setModbusRtuBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setModbusTcpBlock(
    projectId: number,
    data: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setModbusTcpBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setHttpClientBlock(
    projectId: number,
    data: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setHttpClientBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setDatabaseBlock(
    projectId: number,
    data: IDatabaseBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setDatabaseBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setComBlock(
    projectId: number,
    data: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setComBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setConverterBlock(
    projectId: number,
    data: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setConverterBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setGraphBlock(
    projectId: number,
    data: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setGraphBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setIndicatorsBlock(
    projectId: number,
    data: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setIndicatorsBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  setMediaBlock(
    projectId: number,
    data: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return from(
      window.electronAPI.setMediaBlock(
        projectId,
        data,
        inputBlocks,
        outputBlocks,
      ),
    );
  }

  saveProject(projectId: number): Observable<void> {
    return from(window.electronAPI.saveProject(projectId));
  }

  openDemoMode(projectId: number): Observable<void> {
    return from(window.electronAPI.openDemoMode(projectId));
  }

  configureApp(projectId: number): Observable<void> {
    return from(window.electronAPI.configureApp(projectId));
  }
}
