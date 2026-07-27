import { ReOSBus } from '@core/ReOSBus';
import { SYSTEM_CONSTANTS } from '@core/Constants';
import builtinThemes from '@assets/themes/builtin-themes.json';

export interface IThemeModule {
  applyTheme(themeName: (typeof SYSTEM_CONSTANTS.SUPPORTED_THEMES)[number]): void;
}

export class ThemeModule implements IThemeModule {
  private bus: ReOSBus;

  constructor() {
    this.bus = ReOSBus.getInstance();
    this.bus.subscribe('THEME:CHANGED', event => {
      if (event.payload && typeof (event.payload as any).theme === 'string') {
        this.applyTheme((event.payload as any).theme);
      }
    });
  }

  public applyTheme(themeName: (typeof SYSTEM_CONSTANTS.SUPPORTED_THEMES)[number]): void {
    if (typeof document === 'undefined') return;

    const body = document.body;
    body.classList.remove(
      'theme-pure-black',
      'theme-classic-cmd',
      'theme-vscode-dark',
      'theme-matrix',
      'theme-light'
    );

    let className = 'theme-pure-black';
    switch (themeName) {
      case 'Classic CMD':
        className = 'theme-classic-cmd';
        break;
      case 'VS Code Dark+':
        className = 'theme-vscode-dark';
        break;
      case 'Matrix':
        className = 'theme-matrix';
        break;
      case 'Light':
        className = 'theme-light';
        break;
      case 'Pure Black (Re`OS Default)':
      default:
        className = 'theme-pure-black';
        break;
    }

    body.classList.add(className);

    const palette =
      (builtinThemes as any)[themeName] || (builtinThemes as any)['Pure Black (Re`OS Default)'];
    if (palette) {
      document.documentElement.style.setProperty('--reos-bg', palette.background);
      document.documentElement.style.setProperty('--reos-fg', palette.foreground);
      document.documentElement.style.setProperty('--reos-prompt', palette.prompt);
      document.documentElement.style.setProperty('--reos-editor-bg', palette.editorBackground);
      document.documentElement.style.setProperty('--reos-status-bg', palette.statusBackground);
    }

    // Notify that theme has been applied (separate event to avoid infinite loop with THEME:CHANGED)
    this.bus.publish('THEME:APPLIED', { theme: themeName, className });
  }
}
