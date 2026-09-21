import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, fromEvent, switchMap, of, Observable } from 'rxjs';
import { PaperText } from '../../../../paper-ui/base/text/text.directive';
import { PaperSelector } from '../../../../paper-ui/base/selector/selector.component';
import { LanguageProvider } from '../../../../libraries/language/language.directive';
import { ProjectService } from '../../../../libraries/project/project.service';
import {
  CreateProjectDialogComponent,
  DialogService,
  UnsavedChangesDialogComponent,
  type ICreateProjectDialogData,
  type IUnsavedChangesDialogData,
  type TUnsavedChangesResult,
} from '../../../../libraries/dialog';
import type { IProjectFile } from '../../../../../../electron/types/project/project-file/project-file.type';

@Component({
  selector: 'constructor-app-project-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css'],
  imports: [PaperText, PaperSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstructorAppProjectBarComponent extends LanguageProvider {
  readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly dialogService = inject(DialogService);

  readonly openedFileOptions = signal<boolean>(false);
  readonly openedSettingsOptions = signal<boolean>(false);
  readonly openedDocumentationOptions = signal<boolean>(false);
  readonly openedExitOptions = signal<boolean>(false);

  readonly projectPath = computed(
    () => this.projectService.projectFile()?.path?.trim() ?? '',
  );

  readonly projectNameLabel = computed(() => this.projectService.projectFile()?.projectName?.trim() ?? '');

  readonly isDirty = computed(() => this.projectService.isDirty());

  constructor() {
    super();
    // Capture phase + physical KeyS: reliable under RU layout and scene stopPropagation.
    fromEvent<KeyboardEvent>(document, 'keydown', { capture: true })
      .pipe(
        filter((event) => this.isSaveShortcut(event)),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        event.preventDefault();
        event.stopPropagation();
        this.saveProject();
      });
  }

  private isSaveShortcut(event: KeyboardEvent): boolean {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.repeat) {
      return false;
    }
    // Prefer physical key so Ctrl+S works on non-Latin layouts (e.g. RU "ы").
    return event.code === 'KeyS' || event.key.toLowerCase() === 's';
  }

  readonly onFileOptions = (option: string) => {
    const labels = this.labels();
    if (option === labels.new) {
      this.newProject();
      return;
    }
    if (option === labels.save) {
      this.saveProject();
      return;
    }
    if (option === labels.saveAs) {
      this.saveProjectAs();
      return;
    }
    if (option === labels.open) {
      this.openProject();
    }
  };

  readonly onExitOptions = (option: string) => {
    if (option === this.labels().home) {
      this.goHome();
    }
  };

  readonly fileOptions = computed(() => [
    this.labels().new,
    this.labels().open,
    this.labels().save,
    this.labels().saveAs,
  ]);

  readonly settingsOptions = computed(() => [
    this.labels().language,
    this.labels().theme,
    this.labels().about,
    this.labels().settings,
  ]);

  readonly documentationOptions = computed(() => [
    this.labels().tcpServer,
    this.labels().tcpClient,
    this.labels().mqttClient,
    this.labels().httpClient,
    this.labels().modbusRtu,
    this.labels().modbusTcp,
    this.labels().comPort,
    this.labels().database,
    this.labels().converter,
    this.labels().graphs,
    this.labels().indicators,
    this.labels().media,
    this.labels().documentation,
  ]);

  readonly exitOptions = computed(() => [
    this.labels().home,
    this.labels().exit,
  ]);

  private saveProject(): void {
    this.projectService.saveProject().subscribe({ error: () => undefined });
  }

  private saveProjectAs(): void {
    this.projectService.saveProjectAs().subscribe({ error: () => undefined });
  }

  private openProject(): void {
    this.confirmDiscardIfNeeded()
      .pipe(
        switchMap((proceed) =>
          proceed ? this.projectService.openProject() : of(null),
        ),
      )
      .subscribe({
        next: (file) => this.navigateToProject(file),
        error: () => undefined,
      });
  }

  private newProject(): void {
    this.confirmDiscardIfNeeded()
      .pipe(
        switchMap((proceed) => (proceed ? this.promptProjectName() : of(null))),
        switchMap((name) =>
          name ? this.projectService.createProject(name) : of(null),
        ),
      )
      .subscribe({
        next: (file) => this.navigateToProject(file),
        error: () => undefined,
      });
  }

  private promptProjectName(): Observable<string | null> {
    const labels = this.labels();
    return this.dialogService.open<string, ICreateProjectDialogData>(
      CreateProjectDialogComponent,
      {
        label: labels.createProject,
        size: 's',
        data: { projectNameLabel: labels.projectName },
        mainActionLabel: labels.createProject,
        secondaryActionLabel: labels.cancel,
      },
    );
  }

  private navigateToProject(file: IProjectFile | null): void {
    if (!file) {
      return;
    }
    void this.router.navigate(['/constructor', 'project', file.projectId]);
  }

  private goHome(): void {
    this.confirmDiscardIfNeeded().subscribe({
      next: (proceed) => {
        if (proceed) {
          void this.router.navigate(['/']);
        }
      },
      error: () => undefined,
    });
  }

  /** Returns true when the next action may continue. */
  private confirmDiscardIfNeeded(): Observable<boolean> {
    if (!this.projectService.needsSavePrompt()) {
      return of(true);
    }

    const labels = this.labels();
    return this.dialogService
      .open<TUnsavedChangesResult, IUnsavedChangesDialogData>(
        UnsavedChangesDialogComponent,
        {
          label: labels.unsavedChangesTitle,
          size: 's',
          data: {
            message: labels.unsavedChangesMessage,
          },
          mainActionLabel: labels.save,
          secondaryActionLabel: labels.cancel,
          otherActionLabels: [labels.dontSave],
        },
      )
      .pipe(
        switchMap((result) => {
          if (result === 'discard') {
            return of(true);
          }
          if (result === 'save') {
            return this.projectService.saveProject().pipe(
              switchMap((path) => of(path != null)),
            );
          }
          return of(false);
        }),
      );
  }
}
