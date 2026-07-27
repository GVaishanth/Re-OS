import { ReOSBus } from '@core/ReOSBus';
import { MONOCHROME_16X16_ICONS } from '@assets/icons';
import { VFSModule } from '@modules/filesystem/VFSModule';

export interface IExplorerItem {
  path: string;
  name: string;
  isDirectory: boolean;
  iconSvgGlyph: string;
}

export interface IExplorerModule {
  mount(container: HTMLElement): void;
  renderOverlayTree(cwd: string): Promise<void>;
  closeOverlay(): void;
  toggleOverlay(cwd: string): Promise<void>;
}

export class ExplorerModule implements IExplorerModule {
  private bus: ReOSBus;
  private vfs?: VFSModule;
  private container?: HTMLElement;
  private isOpen: boolean = false;
  private expandedDirs: Set<string> = new Set(['C:\\Users\\ReOS']);

  constructor(vfs?: VFSModule) {
    this.bus = ReOSBus.getInstance();
    this.vfs = vfs;

    this.bus.subscribe('EXPLORER:TOGGLE', () => {
      if (this.vfs) {
        void this.toggleOverlay(this.vfs.getCWD());
      }
    });

    this.bus.subscribe('EDITOR:OPEN', () => {
      if (this.isOpen && this.vfs) {
        void this.renderOverlayTree(this.vfs.getCWD());
      }
    });
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.container.innerHTML = `
      <div id="reos-explorer-panel" class="reos-explorer-panel hidden">
        <div class="reos-explorer-header">
          <span style="display:flex; align-items:center; gap:6px;">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1Z"/></svg>
            EXPLORER (GITHUB NODES)
          </span>
          <button id="reos-explorer-close-btn" class="reos-explorer-close-btn">&times;</button>
        </div>
        <div id="reos-explorer-tree" class="reos-explorer-tree"></div>
      </div>
    `;

    const closeBtn = this.container.querySelector('#reos-explorer-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeOverlay());
    }
  }

  public async toggleOverlay(cwd: string): Promise<void> {
    if (this.isOpen) {
      this.closeOverlay();
    } else {
      await this.renderOverlayTree(cwd);
    }
  }

  public async renderOverlayTree(cwd: string): Promise<void> {
    if (!this.container || !this.vfs) return;
    const panel = this.container.querySelector('#reos-explorer-panel') as HTMLElement;
    const tree = this.container.querySelector('#reos-explorer-tree') as HTMLElement;
    if (!panel || !tree) return;

    this.isOpen = true;
    panel.classList.remove('hidden');

    const toggleBtn = document.getElementById('reos-explorer-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerText = '>';
      toggleBtn.classList.add('open');
    }

    try {
      this.expandedDirs.add(cwd);
      let treeHtml = `
        <div class="reos-explorer-root-badge">
          <span class="reos-explorer-icon">${MONOCHROME_16X16_ICONS.folder}</span>
          <span>${cwd}</span>
        </div>
      `;

      treeHtml += await this.buildNodeTree(cwd, 0);
      tree.innerHTML = treeHtml;

      const items = tree.querySelectorAll('.reos-explorer-item');
      items.forEach(item => {
        item.addEventListener('click', e => {
          e.stopPropagation();
          const path = item.getAttribute('data-path');
          const type = item.getAttribute('data-type');
          if (path && type === 'file') {
            this.bus.publish('EDITOR:OPEN_REQUEST', { targetPath: path });
          } else if (path && type === 'directory') {
            if (this.expandedDirs.has(path)) {
              this.expandedDirs.delete(path);
            } else {
              this.expandedDirs.add(path);
            }
            void this.renderOverlayTree(cwd);
          }
        });
      });
    } catch {
      tree.innerHTML = `<div class="reos-explorer-empty">Unable to inspect virtual filesystem</div>`;
    }
  }

  private async buildNodeTree(dirPath: string, depth: number): Promise<string> {
    if (!this.vfs) return '';
    try {
      const entries = await this.vfs.readdir(dirPath);
      let html = '';

      for (const entry of entries) {
        const isDir = entry.type === 'directory';
        let icon: string = MONOCHROME_16X16_ICONS.text;
        if (isDir) {
          icon = MONOCHROME_16X16_ICONS.folder;
        } else {
          const lower = entry.name.toLowerCase();
          if (lower.endsWith('.c') || lower.endsWith('.h')) icon = MONOCHROME_16X16_ICONS.c;
          else if (lower.endsWith('.cpp') || lower.endsWith('.hpp') || lower.endsWith('.cc'))
            icon = MONOCHROME_16X16_ICONS.cpp;
          else if (lower.endsWith('.py')) icon = MONOCHROME_16X16_ICONS.python;
          else if (lower.endsWith('.java')) icon = MONOCHROME_16X16_ICONS.java;
          else if (lower.endsWith('.md')) icon = MONOCHROME_16X16_ICONS.markdown;
        }

        const isExpanded = isDir && this.expandedDirs.has(entry.path);
        const arrow = isDir ? (isExpanded ? '&#9662;' : '&#9656;') : '&nbsp;&nbsp;';
        const indent = depth * 14;

        html += `
          <div class="reos-explorer-item ${isDir ? 'dir-node' : 'file-node'}" data-path="${entry.path}" data-type="${entry.type}" style="padding-left: ${indent + 8}px;">
            <span class="reos-node-arrow">${arrow}</span>
            <span class="reos-explorer-icon">${icon}</span>
            <span class="reos-explorer-name">${entry.name}</span>
          </div>
        `;

        if (isExpanded) {
          html += await this.buildNodeTree(entry.path, depth + 1);
        }
      }
      return html;
    } catch {
      return '';
    }
  }

  public closeOverlay(): void {
    if (!this.container) return;
    const panel = this.container.querySelector('#reos-explorer-panel') as HTMLElement;
    if (panel) {
      panel.classList.add('hidden');
    }
    this.isOpen = false;
    const toggleBtn = document.getElementById('reos-explorer-toggle-btn');
    if (toggleBtn) {
      toggleBtn.innerText = '<';
      toggleBtn.classList.remove('open');
    }
  }
}
