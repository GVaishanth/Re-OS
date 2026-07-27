import { SupportedLanguage } from '@types';
import { CapabilityProfiler } from '@core/CapabilityProfiler';

export interface ICompilerRuntimeModule {
  isSupportedLocally(language: SupportedLanguage): boolean;
  getWorkerUrl(language: SupportedLanguage): string;
}

export class CompilerRuntimeModule implements ICompilerRuntimeModule {
  public isSupportedLocally(_language: SupportedLanguage): boolean {
    const profile = CapabilityProfiler.getProfile();
    return profile ? profile.hasWebWorkers : typeof Worker !== 'undefined';
  }

  public getWorkerUrl(language: SupportedLanguage): string {
    switch (language) {
      case 'C':
      case 'C++':
        return '/src/workers/compiler.c.worker.ts';
      case 'Python':
        return '/src/workers/compiler.py.worker.ts';
      case 'Java':
        return '/src/workers/compiler.java.worker.ts';
      default:
        return '/src/workers/compiler.c.worker.ts';
    }
  }
}
