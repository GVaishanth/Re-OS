import { ReOSBus } from '@core/ReOSBus';

export interface ILayoutState {
  editorOpen: boolean;
  explorerOpen: boolean;
  setEditorOpen(open: boolean): void;
  setExplorerOpen(open: boolean): void;
  toggleEditor(): void;
  toggleExplorer(): void;
}

export class LayoutState implements ILayoutState {
  private static instance: LayoutState;
  private bus = ReOSBus.getInstance();

  public editorOpen: boolean = false;
  public explorerOpen: boolean = false;

  private constructor() {
    // Listen for explicit layout requests
    this.bus.subscribe('LAYOUT:SET_EDITOR', (e) => {
      const open = (e.payload as any)?.open ?? false;
      this.editorOpen = open;
      this.apply();
    });

    this.bus.subscribe('LAYOUT:SET_EXPLORER', (e) => {
      const open = (e.payload as any)?.open ?? false;
      this.explorerOpen = open;
      this.apply();
    });
  }

  public static getInstance(): LayoutState {
    if (!LayoutState.instance) {
      LayoutState.instance = new LayoutState();
    }
    return LayoutState.instance;
  }

  public setEditorOpen(open: boolean): void {
    this.editorOpen = open;
    this.apply();
    this.bus.publish('LAYOUT:EDITOR_CHANGED', { open });
  }

  public setExplorerOpen(open: boolean): void {
    this.explorerOpen = open;
    this.apply();
    this.bus.publish('LAYOUT:EXPLORER_CHANGED', { open });
  }

  public toggleEditor(): void {
    this.setEditorOpen(!this.editorOpen);
  }

  public toggleExplorer(): void {
    this.setExplorerOpen(!this.explorerOpen);
  }

  private apply(): void {
    // Apply to DOM directly (single source of truth)
    const editorZone = document.getElementById('reos-editor-zone');
    const terminalZone = document.getElementById('reos-terminal-zone');
    const explorerPanel = document.getElementById('reos-explorer-panel');

    if (editorZone) {
      if (this.editorOpen) {
        editorZone.classList.remove('hidden');
        editorZone.style.display = 'flex';
        editorZone.classList.add('active');
      } else {
        editorZone.classList.add('hidden');
        editorZone.style.display = 'none';
        editorZone.classList.remove('active');
      }
    }

    if (terminalZone) {
      if (this.editorOpen) {
        terminalZone.classList.add('docked-split');
      } else {
        terminalZone.classList.remove('docked-split');
      }
    }

    if (explorerPanel) {
      if (this.explorerOpen) {
        explorerPanel.classList.remove('hidden');
      } else {
        explorerPanel.classList.add('hidden');
      }
    }
  }
}