import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { EAppMode } from "../../../../electron/types/settings/settings.app-mode.type";
import { ElectronAPIService } from "../electron-api/electron-api.service";

@Injectable({
  providedIn: "root",
})
export class InitializationService {
  private readonly _electronAPI = inject(ElectronAPIService);

  getAppMode(): Observable<EAppMode> {
    return this._electronAPI.getAppMode();
  }
}
