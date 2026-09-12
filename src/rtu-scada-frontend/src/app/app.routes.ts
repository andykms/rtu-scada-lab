import { Routes } from '@angular/router';
import { ConstructorAppRootComponent } from '../sub-apps/contrustor-app/constructor-app-root/constructor-app-root.component';
import { CompiledAppRootComponent } from '../sub-apps/compiled-app/compiled-app-root/compiled-app-root.component';
import { HomeComponent } from '../sub-apps/contrustor-app/home/home.component';
import { ProjectComponent } from '../sub-apps/contrustor-app/project/project.component';
import { SettingsComponent } from '../sub-apps/contrustor-app/settings/settings.component';
import { DocumentationComponent } from '../sub-apps/contrustor-app/documentation/documentation.component';

export const routes: Routes = [
  {
    path: 'constructor',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: '',
        component: ConstructorAppRootComponent,
        children: [
          {
            path: 'home',
            component: HomeComponent,
          },
          {
            path: 'settings',
            component: SettingsComponent,
          },
          {
            path: 'documentation',
            component: DocumentationComponent,
          },
        ],
      },
      {
        path: 'project/:projectId',
        component: ProjectComponent,
      },
    ],
  },
  {
    path: 'compiled',
    component: CompiledAppRootComponent,
  },
  {
    path: '**',
    redirectTo: 'constructor/home',
  },
];
