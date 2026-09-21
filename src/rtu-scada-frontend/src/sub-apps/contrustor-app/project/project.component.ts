import { ChangeDetectionStrategy, Component, inject, OnInit, signal, Type } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { PaperCard } from '../../../paper-ui/layout/card/card.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { ConstructorAppProjectBarComponent } from './bar/bar.component';
import { LanguageProvider } from '../../../libraries/language/language.directive';
import { DialogService } from '../../../libraries/dialog';
import { ProjectService } from '../../../libraries/project/project.service';
import type { IProjectFile } from '../../../../../electron/types/project/project-file/project-file.type';
import type { ITcpServerBlock } from '../../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type';
import type { ITcpClientBlock } from '../../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type';
import type { IMqttClientBlock } from '../../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type';
import type { IModbusRtuBlock } from '../../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type';
import type { IModbusTcpBlock } from '../../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type';
import type { IComBlock } from '../../../../../electron/types/blocks/network-blocks/com/com.type';
import type { IDatabaseBlock } from '../../../../../electron/types/blocks/network-blocks/database/database.type';
import type { IConverterBlock } from '../../../../../electron/types/blocks/internal-blocks/converter/converter.type';
import type { IHttpClientBlock } from '../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import type { IGraphBlock } from '../../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import type { IIndicatorsBlock } from '../../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import type { IMediaBlock } from '../../../../../electron/types/blocks/internal-blocks/media/media.type';
import {
  ICreateBlockDialogData,
  ICreateBlockFormResult,
  ICreateHttpClientFormResult,
  ICreateGraphsFormResult,
  ICreateIndicatorsFormResult,
  ICreateMediaFormResult,
} from './create-block-forms/shared/create-block-dialog.model';
import { TcpServerComponent } from './create-block-forms/tcp-server/tcp-server.component';
import { TcpClientComponent } from './create-block-forms/tcp-client/tcp-client.component';
import { MqttClientComponent } from './create-block-forms/mqtt-client/mqtt-client.component';
import { HttpClientComponent } from './create-block-forms/http-client/http-client.component';
import { ModbusRtuComponent } from './create-block-forms/modbus-rtu/modbus-rtu.component';
import { ModbusTcpComponent } from './create-block-forms/modbus-tcp/modbus-tcp.component';
import { ComComponent } from './create-block-forms/com/com.component';
import { DatabaseComponent } from './create-block-forms/database/database.component';
import { ConverterComponent } from './create-block-forms/converter/converter.component';
import { GraphsComponent } from './create-block-forms/graphs/graphs.component';
import { IndicatorsComponent } from './create-block-forms/indicators/indicators.component';
import { MediaComponent } from './create-block-forms/media/media.component';
import { ConstructorAppSceneComponent } from './scene/scene.component';
import type { ISceneNode } from './scene/scene.models';
import { PaperDivingLine } from "../../../paper-ui/layout/diving-line/diving-line.component";

@Component({
  selector: 'constructor-app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  imports: [
    PaperCard,
    PaperText,
    ConstructorAppProjectBarComponent,
    ConstructorAppSceneComponent,
    PaperDivingLine
],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectComponent extends LanguageProvider implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    if (!Number.isNaN(projectId)) {
      this.projectService.setProjectId(projectId);
    }
  }

  readonly openedList = signal(true);

  readonly openTcpServerDialog = () =>
    this.openCreateBlockDialog<ITcpServerBlock>(
      TcpServerComponent,
      this.labels().tcpServer,
      (result) =>
        this.projectService.createTcpServerBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openTcpClientDialog = () =>
    this.openCreateBlockDialog<ITcpClientBlock>(
      TcpClientComponent,
      this.labels().tcpClient,
      (result) =>
        this.projectService.createTcpClientBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openMqttClientDialog = () =>
    this.openCreateBlockDialog<IMqttClientBlock>(
      MqttClientComponent,
      this.labels().mqttClient,
      (result) =>
        this.projectService.createMqttClientBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openHttpClientDialog = () => {
    const blockId = this.projectService.nextBlockId();
    this.dialogService
      .open<ICreateHttpClientFormResult, ICreateBlockDialogData>(HttpClientComponent, {
        label: this.labels().httpClient,
        size: 'l',
        data: { blockId },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => this.projectService.createHttpClientBlocks(result.blocks)))
      .subscribe();
  };

  readonly openModbusRtuDialog = () =>
    this.openCreateBlockDialog<IModbusRtuBlock>(
      ModbusRtuComponent,
      this.labels().modbusRtu,
      (result) =>
        this.projectService.createModbusRtuBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openModbusTcpDialog = () =>
    this.openCreateBlockDialog<IModbusTcpBlock>(
      ModbusTcpComponent,
      this.labels().modbusTcp,
      (result) =>
        this.projectService.createModbusTcpBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openComDialog = () =>
    this.openCreateBlockDialog<IComBlock>(
      ComComponent,
      this.labels().comPort,
      (result) =>
        this.projectService.createComBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openDatabaseDialog = () =>
    this.openCreateBlockDialog<IDatabaseBlock>(
      DatabaseComponent,
      this.labels().database,
      (result) =>
        this.projectService.createDatabaseBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openConverterDialog = () =>
    this.openCreateBlockDialog<IConverterBlock>(
      ConverterComponent,
      this.labels().converter,
      (result) =>
        this.projectService.createConverterBlock(
          result.block,
          result.inputBlocks,
          result.outputBlocks,
        ),
    );

  readonly openGraphsDialog = () => {
    const blockId = this.projectService.nextBlockId();
    this.dialogService
      .open<ICreateGraphsFormResult, ICreateBlockDialogData>(GraphsComponent, {
        label: this.labels().graphs,
        size: 'l',
        data: { blockId },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => this.projectService.createGraphBlocks(result.blocks)))
      .subscribe();
  };

  readonly openIndicatorsDialog = () => {
    const blockId = this.projectService.nextBlockId();
    this.dialogService
      .open<ICreateIndicatorsFormResult, ICreateBlockDialogData>(IndicatorsComponent, {
        label: this.labels().indicators,
        size: 'l',
        data: { blockId },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => this.projectService.createIndicatorsBlocks(result.blocks)))
      .subscribe();
  };

  readonly openMediaDialog = () => {
    const blockId = this.projectService.nextBlockId();
    this.dialogService
      .open<ICreateMediaFormResult, ICreateBlockDialogData>(MediaComponent, {
        label: this.labels().media,
        size: 'l',
        data: { blockId },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => this.projectService.createMediaBlocks(result.blocks)))
      .subscribe();
  };

  openEditBlock(node: ISceneNode): void {
    const labels = this.labels() as Record<string, string>;
    const editTitle = (kindLabel: string) =>
      `${labels['editBlock'] ?? 'Edit'}: ${kindLabel}`;

    switch (node.kind) {
      case 'tcpServer':
        this.openEditSingleBlock<ITcpServerBlock>(
          node,
          TcpServerComponent,
          editTitle(labels['tcpServer'] ?? node.kindLabel),
          (result) =>
            this.projectService.createTcpServerBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'tcpClient':
        this.openEditSingleBlock<ITcpClientBlock>(
          node,
          TcpClientComponent,
          editTitle(labels['tcpClient'] ?? node.kindLabel),
          (result) =>
            this.projectService.createTcpClientBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'mqttClient':
        this.openEditSingleBlock<IMqttClientBlock>(
          node,
          MqttClientComponent,
          editTitle(labels['mqttClient'] ?? node.kindLabel),
          (result) =>
            this.projectService.createMqttClientBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'modbusRtu':
        this.openEditSingleBlock<IModbusRtuBlock>(
          node,
          ModbusRtuComponent,
          editTitle(labels['modbusRtu'] ?? node.kindLabel),
          (result) =>
            this.projectService.createModbusRtuBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'modbusTcp':
        this.openEditSingleBlock<IModbusTcpBlock>(
          node,
          ModbusTcpComponent,
          editTitle(labels['modbusTcp'] ?? node.kindLabel),
          (result) =>
            this.projectService.createModbusTcpBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'comPort':
        this.openEditSingleBlock<IComBlock>(
          node,
          ComComponent,
          editTitle(labels['comPort'] ?? node.kindLabel),
          (result) =>
            this.projectService.createComBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'database':
        this.openEditSingleBlock<IDatabaseBlock>(
          node,
          DatabaseComponent,
          editTitle(labels['database'] ?? node.kindLabel),
          (result) =>
            this.projectService.createDatabaseBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'converter':
        this.openEditSingleBlock<IConverterBlock>(
          node,
          ConverterComponent,
          editTitle(labels['converter'] ?? node.kindLabel),
          (result) =>
            this.projectService.createConverterBlock(
              result.block,
              result.inputBlocks,
              result.outputBlocks,
            ),
        );
        break;
      case 'httpClient':
        this.openEditHttpGroup(node, editTitle(labels['httpClient'] ?? node.kindLabel));
        break;
      case 'graphs':
        this.openEditMultiSingle<IGraphBlock, ICreateGraphsFormResult>(
          node,
          GraphsComponent,
          editTitle(labels['graphs'] ?? node.kindLabel),
          (result) => this.projectService.createGraphBlocks(result.blocks),
        );
        break;
      case 'indicators':
        this.openEditMultiSingle<IIndicatorsBlock, ICreateIndicatorsFormResult>(
          node,
          IndicatorsComponent,
          editTitle(labels['indicators'] ?? node.kindLabel),
          (result) => this.projectService.createIndicatorsBlocks(result.blocks),
        );
        break;
      case 'media':
        this.openEditMultiSingle<IMediaBlock, ICreateMediaFormResult>(
          node,
          MediaComponent,
          editTitle(labels['media'] ?? node.kindLabel),
          (result) => this.projectService.createMediaBlocks(result.blocks),
        );
        break;
      default:
        break;
    }
  }

  private openEditSingleBlock<T>(
    node: ISceneNode,
    component: Type<unknown>,
    label: string,
    save: (result: ICreateBlockFormResult<T>) => Observable<IProjectFile>,
  ): void {
    const blockId = node.primaryBlockId;
    const found = this.projectService.findBlockById(blockId);
    if (!found) {
      return;
    }
    const connections = this.projectService.getBlockConnections(blockId);
    this.dialogService
      .open<ICreateBlockFormResult<T>, ICreateBlockDialogData<T>>(component, {
        label,
        size: 'l',
        data: {
          blockId,
          isEdit: true,
          initialBlock: found.block as T,
          inputBlocks: connections.inputBlocks,
          outputBlocks: connections.outputBlocks,
        },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => save(result)))
      .subscribe();
  }

  private openEditHttpGroup(node: ISceneNode, label: string): void {
    const blocks = this.projectService.getHttpBlocksByIds(node.memberBlockIds);
    if (!blocks.length) {
      return;
    }
    const connections = this.projectService.getBlockConnections(blocks[0].blockId);
    this.dialogService
      .open<ICreateHttpClientFormResult, ICreateBlockDialogData<IHttpClientBlock>>(
        HttpClientComponent,
        {
          label,
          size: 'l',
          data: {
            blockId: blocks[0].blockId,
            isEdit: true,
            initialBlocks: blocks,
            inputBlocks: connections.inputBlocks,
          },
          mainActionLabel: this.labels().save,
          secondaryActionLabel: this.labels().cancel,
        },
      )
      .pipe(switchMap((result) => this.projectService.createHttpClientBlocks(result.blocks)))
      .subscribe();
  }

  private openEditMultiSingle<TBlock, TResult>(
    node: ISceneNode,
    component: Type<unknown>,
    label: string,
    save: (result: TResult) => Observable<IProjectFile>,
  ): void {
    const blockId = node.memberBlockIds[0] ?? node.primaryBlockId;
    const found = this.projectService.findBlockById(blockId);
    if (!found) {
      return;
    }
    const connections = this.projectService.getBlockConnections(blockId);
    this.dialogService
      .open<TResult, ICreateBlockDialogData<TBlock>>(component, {
        label,
        size: 'l',
        data: {
          blockId,
          isEdit: true,
          initialBlocks: [found.block as TBlock],
          inputBlocks: connections.inputBlocks,
          outputBlocks: connections.outputBlocks,
        },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => save(result)))
      .subscribe();
  }

  private openCreateBlockDialog<T>(
    component: Type<unknown>,
    label: string,
    create: (result: ICreateBlockFormResult<T>) => Observable<IProjectFile>,
  ): void {
    const blockId = this.projectService.nextBlockId();
    this.dialogService
      .open<ICreateBlockFormResult<T>, ICreateBlockDialogData>(component, {
        label,
        size: 'l',
        data: { blockId },
        mainActionLabel: this.labels().save,
        secondaryActionLabel: this.labels().cancel,
      })
      .pipe(switchMap((result) => create(result)))
      .subscribe();
  }
}
