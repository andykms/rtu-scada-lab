import { Injectable, signal } from '@angular/core';
import type { IProjectFileInfo } from '../../../../electron/types/project/project-file/project-file-info.type';
import type { IProjectFile } from '../../../../electron/types/project/project-file/project-file.type';

const STORAGE_KEY = 'rtu-scada-lab.recent-projects';
const MAX_RECENT = 20;

@Injectable({
  providedIn: 'root',
})
export class RecentProjectsService {
  readonly projects = signal<IProjectFileInfo[]>(this.readFromStorage());

  remember(file: IProjectFile | IProjectFileInfo): void {
    const info = toProjectFileInfo(file);
    if (!info.path) {
      return;
    }

    const pathKey = normalizePath(info.path);
    const next = [
      info,
      ...this.projects().filter((item) => normalizePath(item.path) !== pathKey),
    ].slice(0, MAX_RECENT);

    this.write(next);
  }

  remove(path: string): void {
    const pathKey = normalizePath(path);
    if (!pathKey) {
      return;
    }
    this.write(
      this.projects().filter((item) => normalizePath(item.path) !== pathKey),
    );
  }

  private write(projects: IProjectFileInfo[]): void {
    this.projects.set(projects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Ignore quota / private-mode failures; in-memory list still updates.
    }
  }

  private readFromStorage(): IProjectFileInfo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((item) => (isProjectFileInfo(item) ? sanitizeInfo(item) : null))
        .filter((item): item is IProjectFileInfo => item != null)
        .slice(0, MAX_RECENT);
    } catch {
      return [];
    }
  }
}

export function toProjectFileInfo(
  file: IProjectFile | IProjectFileInfo,
): IProjectFileInfo {
  return {
    projectLab: String(file.projectLab ?? ''),
    projectLabVersion: String(file.projectLabVersion ?? ''),
    projectId: Number(file.projectId),
    projectName: String(file.projectName ?? ''),
    createdAt: String(file.createdAt ?? ''),
    updatedAt: String(file.updatedAt ?? ''),
    path: String(file.path ?? '').trim(),
  };
}

function sanitizeInfo(item: IProjectFileInfo): IProjectFileInfo | null {
  const info = toProjectFileInfo(item);
  if (!info.path || !Number.isFinite(info.projectId)) {
    return null;
  }
  return info;
}

function isProjectFileInfo(value: unknown): value is IProjectFileInfo {
  return typeof value === 'object' && value !== null;
}

function normalizePath(path: string): string {
  return path.trim().replace(/\\/g, '/').toLowerCase();
}
