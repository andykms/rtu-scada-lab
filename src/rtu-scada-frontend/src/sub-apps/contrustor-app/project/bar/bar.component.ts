import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PaperText } from '../../../../paper-ui/base/text/text.directive';
import { PaperSelector } from '../../../../paper-ui/base/selector/selector.component';
import { Router } from '@angular/router';
import { LanguageProvider } from '../../../../libraries/language/language.directive';

@Component({
  selector: 'constructor-app-project-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css'],
  imports: [PaperText, PaperSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstructorAppProjectBarComponent extends LanguageProvider {
  readonly router = inject(Router);

  readonly openedFileOptions = signal<boolean>(false);
  readonly openedSettingsOptions = signal<boolean>(false);
  readonly openedDocumentationOptions = signal<boolean>(false);
  readonly openedExitOptions = signal<boolean>(false);

  readonly onExitOptions = (option: string) => {
    if (option === this.labels().home) {
      this.router.navigate(['/']);
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
}
