import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ElectronAPIService } from '../../../libraries/electron-api/electron-api.service';
import type { IProjectFileInfo } from '../../../../../electron/types/project/project-file/project-file-info.type';
import { MenuComponent } from './menu/menu.component';
import { PaperDivingLine } from '../../../paper-ui/layout/diving-line/diving-line.component';
import { PaperModalComponent } from '../../../paper-ui/layout/modal/modal.component';
import { PaperTextfield } from '../../../paper-ui/base/textfield/textfield.component';
import { PaperInput } from '../../../paper-ui/base/input/input.directive';
import { PaperLabel } from '../../../paper-ui/base/label/label.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { ProjectListComponent } from './projects-list/project-list.component';
import { LanguageProvider } from '../../../libraries/language/language.directive';
import { ProjectService } from '../../../libraries/project/project.service';
import { RecentProjectsService } from '../../../libraries/recent-projects/recent-projects.service';
import {
  ConfirmDialogComponent,
  DialogService,
  type IConfirmDialogData,
} from '../../../libraries/dialog';

@Component({
  selector: 'constructor-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    MenuComponent,
    ProjectListComponent,
    PaperDivingLine,
    PaperModalComponent,
    PaperTextfield,
    PaperInput,
    PaperLabel,
    PaperText,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent extends LanguageProvider {
  private readonly _electronAPI = inject(ElectronAPIService);
  private readonly _projectService = inject(ProjectService);
  private readonly _recentProjects = inject(RecentProjectsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _router = inject(Router);

  readonly recentProjects = this._recentProjects.projects;

  readonly createProjectModalOpened = signal(false);
  readonly isCreatingProject = signal(false);
  readonly projectNameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  readonly onCreateProject = (): void => {
    this.createProjectModalOpened.set(true);
  };

  readonly onOpenProject = (): void => {
    this._projectService.openProject().subscribe({
      next: (projectFile) => {
        if (!projectFile) {
          return;
        }
        void this._router.navigate([
          '/constructor',
          'project',
          projectFile.projectId,
        ]);
      },
      error: () => undefined,
    });
  };

  readonly onOpenRecentProject = (project: IProjectFileInfo): void => {
    const path = project.path?.trim();
    if (!path) {
      this.showOpenError();
      return;
    }

    this._projectService.openProjectByPath(path).subscribe({
      next: (projectFile) => {
        void this._router.navigate([
          '/constructor',
          'project',
          projectFile.projectId,
        ]);
      },
      error: () => this.showOpenError(),
    });
  };

  readonly onRemoveRecentProject = (project: IProjectFileInfo): void => {
    this._recentProjects.remove(project.path);
  };

  readonly closeCreateProjectModal = (): void => {
    if (this.isCreatingProject()) {
      return;
    }
    this.createProjectModalOpened.set(false);
    this.projectNameControl.reset();
  };

  readonly submitCreateProject = (): void => {
    const projectName = this.projectNameControl.value.trim();
    if (
      !projectName ||
      this.projectNameControl.invalid ||
      this.isCreatingProject()
    ) {
      this.projectNameControl.markAsTouched();
      return;
    }

    this.isCreatingProject.set(true);
    this._projectService.createProject(projectName).subscribe({
      next: (projectFile) => {
        this.createProjectModalOpened.set(false);
        this.projectNameControl.reset();
        void this._router.navigate([
          '/constructor',
          'project',
          projectFile.projectId,
        ]);
      },
      error: () => this.isCreatingProject.set(false),
      complete: () => this.isCreatingProject.set(false),
    });
  };

  private showOpenError(): void {
    const labels = this.labels();
    this._dialogService
      .open<boolean, IConfirmDialogData>(ConfirmDialogComponent, {
        label: labels.openProjectErrorTitle,
        size: 's',
        data: { message: labels.openProjectErrorMessage },
        mainActionLabel: labels.ok,
        secondaryActionLabel: '',
      })
      .subscribe({ error: () => undefined });
  }
}
