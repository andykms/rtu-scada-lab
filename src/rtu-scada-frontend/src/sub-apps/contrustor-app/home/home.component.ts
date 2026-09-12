import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ElectronAPIService } from '../../../libraries/electron-api/electron-api.service';
import { IProjectFileInfo } from '../../../../../electron/types/project/project-file/project-file-info.type';
import { MenuComponent } from './menu/menu.component';
import { LanguageService } from '../../../libraries/language/language.service';
import { PaperDivingLine } from '../../../paper-ui/layout/diving-line/diving-line.component';
import { PaperModalComponent } from '../../../paper-ui/layout/modal/modal.component';
import { PaperTextfield } from '../../../paper-ui/base/textfield/textfield.component';
import { PaperInput } from '../../../paper-ui/base/input/input.directive';
import { PaperLabel } from '../../../paper-ui/base/label/label.directive';
import { PaperText } from '../../../paper-ui/base/text/text.directive';
import { ProjectListComponent } from './projects-list/project-list.component';
import { LanguageProvider } from '../../../libraries/language/language.directive';

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
    readonly PROJECTS_MOCK: IProjectFileInfo[] = [
        {
            projectLab: 'RTU-SCADA',
            projectLabVersion: '1.0.0',
            projectId: 1,
            projectName: 'Промышленный цех',
            createdAt: '2026-01-15T10:30:00.000Z',
            updatedAt: '2026-09-10T08:12:00.000Z',
            path: 'D:/Projects/rtu-scada/projects/industrial-workshop',
        },
        {
            projectLab: 'RTU-SCADA',
            projectLabVersion: '1.0.0',
            projectId: 2,
            projectName: 'Насосная станция',
            createdAt: '2026-03-02T14:45:00.000Z',
            updatedAt: '2026-08-22T17:05:00.000Z',
            path: 'D:/Projects/rtu-scada/projects/pumping-station',
        },
        {
            projectLab: 'RTU-SCADA',
            projectLabVersion: '1.0.0',
            projectId: 3,
            projectName: 'Котельная №2',
            createdAt: '2026-05-20T09:00:00.000Z',
            updatedAt: '2026-09-11T06:40:00.000Z',
            path: 'D:/Projects/rtu-scada/projects/boiler-house-2',
        },
        {
            projectLab: 'RTU-SCADA',
            projectLabVersion: '1.0.0',
            projectId: 4,
            projectName: 'Вентиляция склада',
            createdAt: '2026-07-11T11:20:00.000Z',
            updatedAt: '2026-09-05T13:30:00.000Z',
            path: 'D:/Projects/rtu-scada/projects/warehouse-ventilation',
        },
    ];

    readonly _electronAPI = inject(ElectronAPIService);
    readonly _router = inject(Router);

    readonly createProjectModalOpened = signal(false);
    readonly isCreatingProject = signal(false);
    readonly projectNameControl = new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
    });

    readonly onCreateProject = (): void => {
        this.createProjectModalOpened.set(true);
    }

    readonly closeCreateProjectModal = (): void => {
        if (this.isCreatingProject()) {
            return;
        }
        this.createProjectModalOpened.set(false);
        this.projectNameControl.reset();
    }

    readonly submitCreateProject = (): void => {
        const projectName = this.projectNameControl.value.trim();
        if (!projectName || this.projectNameControl.invalid || this.isCreatingProject()) {
            this.projectNameControl.markAsTouched();
            return;
        }

        this.isCreatingProject.set(true);
        this._electronAPI.createProject(projectName).subscribe({
            next: (projectId) => {
                this.createProjectModalOpened.set(false);
                this.projectNameControl.reset();
                void this._router.navigate(['/constructor', 'project', projectId]);
            },
            error: () => this.isCreatingProject.set(false),
            complete: () => this.isCreatingProject.set(false),
        });
    }
}