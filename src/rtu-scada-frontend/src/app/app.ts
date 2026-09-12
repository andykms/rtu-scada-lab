import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { InitializationService } from '../libraries/initialization/initialization.service';
import { EAppMode } from '../../../electron/types/settings/settings.app-mode.type';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  readonly _initializationService = inject(InitializationService);
  readonly _router = inject(Router);

  ngOnInit() {
    this._initializationService.getAppMode().subscribe(mode => 
      this._router.navigate([mode === EAppMode.CONSTRUCTOR ? 'constructor' : 'compiled', 'home'])
  );
  }
}
