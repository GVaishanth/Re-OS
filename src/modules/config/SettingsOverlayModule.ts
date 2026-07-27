import { ReOSBus } from '@core/ReOSBus';
import { SettingsModule, ISystemSettings } from './SettingsModule';
import { SYSTEM_CONSTANTS } from '@core/Constants';

export interface ISettingsOverlayModule {
  mount(container: HTMLElement): void;
  toggleOverlay(): void;
  closeOverlay(): void;
}

export class SettingsOverlayModule implements ISettingsOverlayModule {
  private bus: ReOSBus;
  private settingsModule: SettingsModule;
  private container?: HTMLElement;
  private isOpen: boolean = false;

  constructor(settingsModule: SettingsModule) {
    this.bus = ReOSBus.getInstance();
    this.settingsModule = settingsModule;

    this.bus.subscribe('SETTINGS:TOGGLE', () => {
      this.toggleOverlay();
    });

    this.bus.subscribe('SETTINGS:UPDATED', () => {
      if (this.isOpen) {
        this.renderForm();
      }
    });
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.container.innerHTML = `
      <div id="reos-settings-modal" class="reos-settings-modal hidden">
        <div class="reos-settings-card">
          <div class="reos-settings-header">
            <span>Re\`OS SYSTEM SETTINGS</span>
            <button id="reos-settings-close-btn" class="reos-settings-close-btn">&times;</button>
          </div>
          <div id="reos-settings-body" class="reos-settings-body"></div>
        </div>
      </div>
    `;

    const closeBtn = this.container.querySelector('#reos-settings-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeOverlay());
    }

    const modal = this.container.querySelector('#reos-settings-modal');
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) this.closeOverlay();
      });
    }
  }

  public toggleOverlay(): void {
    if (this.isOpen) {
      this.closeOverlay();
    } else {
      this.openOverlay();
    }
  }

  public openOverlay(): void {
    if (!this.container) return;
    const modal = this.container.querySelector('#reos-settings-modal') as HTMLElement;
    if (modal) {
      modal.classList.remove('hidden');
      this.isOpen = true;
      this.renderForm();
    }
  }

  public closeOverlay(): void {
    if (!this.container) return;
    const modal = this.container.querySelector('#reos-settings-modal') as HTMLElement;
    if (modal) {
      modal.classList.add('hidden');
      this.isOpen = false;
    }
  }

  private renderForm(): void {
    if (!this.container) return;
    const body = this.container.querySelector('#reos-settings-body') as HTMLElement;
    if (!body) return;

    const current: ISystemSettings = this.settingsModule.getSettings();

    let themeOptions = '';
    for (const t of SYSTEM_CONSTANTS.SUPPORTED_THEMES) {
      themeOptions += `<option value="${t}" ${t === current.theme ? 'selected' : ''}>${t}</option>`;
    }

    let fontSizeOptions = '';
    for (const sz of [12, 13, 14, 15, 16, 18, 20, 22, 24]) {
      fontSizeOptions += `<option value="${sz}" ${sz === current.fontSizePx ? 'selected' : ''}>${sz}px</option>`;
    }

    body.innerHTML = `
      <div class="reos-settings-section">
        <label class="reos-settings-label" for="setting-theme">System Theme (70% CMD / 20% Editor)</label>
        <select id="setting-theme" class="reos-settings-select">${themeOptions}</select>
      </div>

      <div class="reos-settings-section">
        <label class="reos-settings-label" for="setting-font">Monospaced Font Size</label>
        <select id="setting-font" class="reos-settings-select">${fontSizeOptions}</select>
      </div>

      <div class="reos-settings-section">
        <label class="reos-settings-label" for="setting-autosave">Auto Save Buffer</label>
        <select id="setting-autosave" class="reos-settings-select">
          <option value="2000" ${current.autoSaveDelayMs === 2000 ? 'selected' : ''}>Enabled (2 seconds delay)</option>
          <option value="5000" ${current.autoSaveDelayMs === 5000 ? 'selected' : ''}>Enabled (5 seconds delay)</option>
          <option value="0" ${!current.autoSaveDelayMs ? 'selected' : ''}>Disabled (Manual Ctrl+S only)</option>
        </select>
      </div>

      <div class="reos-settings-section">
        <label class="reos-settings-label">
          <input type="checkbox" id="setting-wordwrap" ${current.wordWrap ? 'checked' : ''} />
          Word Wrap in Modal Code Editor (20% VS Code Layer)
        </label>
      </div>

      <div class="reos-settings-actions">
        <button id="setting-reset-btn" class="reos-settings-reset-btn">Reset All to Factory Defaults</button>
      </div>

      <div class="reos-settings-about">
        <strong>Re\`OS v1.0.0 — Local-First Environment</strong>
        <p>100% Client-Side WebAssembly & Web Worker execution. Zero cloud compilation, zero backend telemetry. Inspired by Windows CMD (70%), VS Code modal editor (20%), and Chrome tabs (10%).</p>
      </div>
    `;

    const themeSelect = body.querySelector('#setting-theme') as HTMLSelectElement;
    if (themeSelect) {
      themeSelect.addEventListener('change', () => {
        void this.settingsModule.updateSetting('theme', themeSelect.value as any);
      });
    }

    const fontSelect = body.querySelector('#setting-font') as HTMLSelectElement;
    if (fontSelect) {
      fontSelect.addEventListener('change', () => {
        const val = parseInt(fontSelect.value, 10) || 14;
        void this.settingsModule.updateSetting('fontSizePx', val);
        document.documentElement.style.setProperty('--reos-font-size', `${val}px`);
      });
    }

    const autoSaveSelect = body.querySelector('#setting-autosave') as HTMLSelectElement;
    if (autoSaveSelect) {
      autoSaveSelect.addEventListener('change', () => {
        const val = parseInt(autoSaveSelect.value, 10);
        void this.settingsModule.updateSetting('autoSaveDelayMs', val > 0 ? val : null);
      });
    }

    const wordWrapCheckbox = body.querySelector('#setting-wordwrap') as HTMLInputElement;
    if (wordWrapCheckbox) {
      wordWrapCheckbox.addEventListener('change', () => {
        void this.settingsModule.updateSetting('wordWrap', wordWrapCheckbox.checked);
        const textarea = document.getElementById('reos-editor-textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.wrap = wordWrapCheckbox.checked ? 'soft' : 'off';
        }
      });
    }

    const resetBtn = body.querySelector('#setting-reset-btn') as HTMLButtonElement;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        void this.settingsModule.resetToDefault();
        document.documentElement.style.setProperty('--reos-font-size', '14px');
        const textarea = document.getElementById('reos-editor-textarea') as HTMLTextAreaElement;
        if (textarea) textarea.wrap = 'off';
      });
    }
  }
}
