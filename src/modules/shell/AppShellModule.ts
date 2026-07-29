import { ReOSBus } from '@core/ReOSBus';
import { TabManagerModule } from './TabManagerModule';
import { StatusBarModule } from './StatusBarModule';
import { TerminalEngineModule } from '@modules/terminal/TerminalEngineModule';
import { EditorModule } from '@modules/editor/EditorModule';
import { VFSModule } from '@modules/filesystem/VFSModule';
import { FileTransferModule } from '@modules/filesystem/FileTransferModule';
import { CommandDispatcher } from '@modules/commands/CommandDispatcher';
import { RunCommandController } from '@modules/execution/RunCommandController';
import { SettingsModule } from '@modules/config/SettingsModule';
import { ThemeModule } from '@modules/config/ThemeModule';
import { SettingsOverlayModule } from '@modules/config/SettingsOverlayModule';
import { LayoutState } from './LayoutState';

import {
  CdCommandModule,
  DirCommandModule,
  MkdirCommandModule,
  DelCommandModule,
  CopyCommandModule,
  MoveCommandModule,
  RenCommandModule,
  ClrCommandModule,
  TypeCommandModule,
  EditCommandModule,
  RunCommandModule,
  HistoryCommandModule,
  VersionCommandModule,
  HelpCommandModule,
  EchoCommandModule,
  TreeCommandModule,
  FindCommandModule,
  AttribCommandModule,
  DateCommandModule,
  TimeCommandModule,
  ExitCommandModule,
  RecentCommandModule,
  ProjectsCommandModule,
  ThemeCommandModule,
  SettingsCommandModule,
  AboutCommandModule,
  UploadCommandModule,
  DownloadCommandModule
} from '@modules/commands';

export interface IAppShellModule {
  mount(rootElement: HTMLElement): Promise<void>;
  updateLayoutSplit(hasActiveEditor: boolean): void;
}

export class AppShellModule implements IAppShellModule {
  private bus: ReOSBus;
  private vfs: VFSModule;
  private tabManager: TabManagerModule;
  private statusBar: StatusBarModule;
  private terminal: TerminalEngineModule;
  private editor: EditorModule;
  private fileTransfer: FileTransferModule;
  private dispatcher: CommandDispatcher;
  private runController: RunCommandController;
  private settings: SettingsModule;
  private theme: ThemeModule;
  private settingsOverlay: SettingsOverlayModule;
  private layout: LayoutState;

  constructor() {
    this.bus = ReOSBus.getInstance();
    this.vfs = new VFSModule();
    this.tabManager = new TabManagerModule();
    this.statusBar = new StatusBarModule();
    this.terminal = new TerminalEngineModule(this.vfs);
    this.editor = new EditorModule(this.vfs);
    this.fileTransfer = new FileTransferModule(this.vfs);
    this.dispatcher = new CommandDispatcher();
    this.runController = new RunCommandController(this.vfs, this.editor);
    this.settings = new SettingsModule();
    this.theme = new ThemeModule();
    this.settingsOverlay = new SettingsOverlayModule(this.settings);
    this.layout = LayoutState.getInstance();

    void this.runController;
    this.registerCommands();
    this.bindEventBroker();
  }

  private registerCommands(): void {
    this.dispatcher.registerCommand(new CdCommandModule());
    this.dispatcher.registerCommand(new DirCommandModule());
    this.dispatcher.registerCommand(new MkdirCommandModule());
    this.dispatcher.registerCommand(new DelCommandModule());
    this.dispatcher.registerCommand(new CopyCommandModule());
    this.dispatcher.registerCommand(new MoveCommandModule());
    this.dispatcher.registerCommand(new RenCommandModule());
    this.dispatcher.registerCommand(new ClrCommandModule());
    this.dispatcher.registerCommand(new TypeCommandModule());
    this.dispatcher.registerCommand(new EditCommandModule());
    this.dispatcher.registerCommand(new RunCommandModule());
    this.dispatcher.registerCommand(new HistoryCommandModule());
    this.dispatcher.registerCommand(new VersionCommandModule());
    this.dispatcher.registerCommand(new HelpCommandModule(() => this.dispatcher));
    this.dispatcher.registerCommand(new EchoCommandModule());
    this.dispatcher.registerCommand(new TreeCommandModule());
    this.dispatcher.registerCommand(new FindCommandModule());
    this.dispatcher.registerCommand(new AttribCommandModule());
    this.dispatcher.registerCommand(new DateCommandModule());
    this.dispatcher.registerCommand(new TimeCommandModule());
    this.dispatcher.registerCommand(new ExitCommandModule());
    this.dispatcher.registerCommand(new RecentCommandModule());
    this.dispatcher.registerCommand(new ProjectsCommandModule());
    this.dispatcher.registerCommand(new ThemeCommandModule());
    this.dispatcher.registerCommand(new SettingsCommandModule());
    this.dispatcher.registerCommand(new AboutCommandModule());
    this.dispatcher.registerCommand(new UploadCommandModule());
    this.dispatcher.registerCommand(new DownloadCommandModule());
  }

  private bindEventBroker(): void {
    this.bus.subscribe('CMD:SUBMIT', event => {
      if (event.payload) {
        const { command } = event.payload as any;
        void (async () => {
          await this.dispatcher.dispatch(command, {
            cwd: this.vfs.getCWD(),
            terminalBufferId: 'primary-cmd',
            activeEditorFile: this.editor.getActiveBuffer()?.path || null
          });
        })();
      }
    });

    this.bus.subscribe('VFS:CD_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          const success = await this.vfs.setCWD(targetPath);
          if (!success) {
            this.terminal.writeError(`The system cannot find the path specified: ${targetPath}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:DIR_REQUEST', event => {
      if (event.payload) {
        const { targetPath, detailed } = event.payload as any;
        void (async () => {
          try {
            const entries = await this.vfs.readdir(targetPath);
            let out = ` Volume in drive C is Re\`OS Virtual Disk\n Directory of ${targetPath}\n\n`;
            let filesCount = 0;
            let dirsCount = 0;
            let totalBytes = 0;

            for (const e of entries) {
              const dateStr = new Date(e.modifiedAt)
                .toISOString()
                .replace('T', ' ')
                .substring(0, 16);
              if (e.type === 'directory') {
                if (detailed) {
                  out += `drwxr-xr-x    ${dateStr}    <DIR>          ${e.name}\n`;
                } else {
                  out += `${dateStr}    <DIR>          ${e.name}\n`;
                }
                dirsCount++;
              } else {
                if (detailed) {
                  out += `-rw-r--r--    ${dateStr}    ${String(e.size).padStart(14, ' ')} ${e.name}\n`;
                } else {
                  out += `${dateStr}    ${String(e.size).padStart(14, ' ')} ${e.name}\n`;
                }
                filesCount++;
                totalBytes += e.size;
              }
            }
            out += `               ${filesCount} File(s)    ${totalBytes} bytes\n`;
            out += `               ${dirsCount} Dir(s)     52,428,800 bytes free\n\n`;
            this.terminal.writeOutput(out);
          } catch {
            this.terminal.writeError(`Directory not found: ${targetPath}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:MKDIR_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          const success = await this.vfs.mkdir(targetPath);
          if (!success) {
            this.terminal.writeError(`A subdirectory or file ${targetPath} already exists.\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:DEL_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          const active = this.editor.getActiveBuffer();
          if (active && active.path.toLowerCase().endsWith(targetPath.toLowerCase())) {
            this.terminal.writeError(`[Error: File '${targetPath}' is currently open. Close before deleting.]\n`);
            return;
          }
          const isProtected = await this.vfs.isProtected(targetPath);
          if (isProtected) {
            this.terminal.writeError(`Access Denied: '${targetPath}' is protected.\n`);
            return;
          }
          const success = await this.vfs.moveToRecycleBin(targetPath);
          if (!success) {
            this.terminal.writeError(`Could Not Delete ${targetPath}\n`);
          } else {
            this.terminal.writeOutput(`Moved to Recycle Bin: ${targetPath}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:COPY_REQUEST', event => {
      if (event.payload) {
        const { source, destination, rawContent } = event.payload as any;
        void (async () => {
          try {
            const text =
              rawContent !== undefined ? rawContent : await this.vfs.readFileAsText(source);
            let destPath = destination;
            if (!destPath.includes('\\') && !destPath.includes('/')) {
              destPath = `${this.vfs.getCWD()}\\${destination}`.replace(/\\+/g, '\\');
            }
            await this.vfs.writeFile(destPath, text);
            if (rawContent === undefined) {
              this.terminal.writeOutput(`        1 file(s) copied.\n`);
            }
          } catch {
            if (rawContent === undefined) {
              this.terminal.writeError(`The system cannot find the file specified: ${source}\n`);
            }
          }
        })();
      }
    });

    this.bus.subscribe('VFS:MOVE_REQUEST', event => {
      if (event.payload) {
        const { source, destination } = event.payload as any;
        void (async () => {
          try {
            const text = await this.vfs.readFileAsText(source);
            await this.vfs.writeFile(destination, text);
            await this.vfs.unlink(source);
            this.terminal.writeOutput(`        1 file(s) moved.\n`);
          } catch {
            this.terminal.writeError(`The system cannot find the file specified: ${source}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:RENAME_REQUEST', event => {
      if (event.payload) {
        const { oldName, newName } = event.payload as any;
        void (async () => {
          try {
            const text = await this.vfs.readFileAsText(oldName);
            await this.vfs.writeFile(newName, text);
            await this.vfs.unlink(oldName);
          } catch {
            this.terminal.writeError(`The system cannot find the file specified: ${oldName}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:TYPE_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          try {
            const text = await this.vfs.readFileAsText(targetPath);
            this.terminal.writeOutput(`${text}\n`);
          } catch {
            this.terminal.writeError(`The system cannot find the file specified: ${targetPath}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:FIND_REQUEST', event => {
      if (event.payload) {
        const { query, targetFile } = event.payload as any;
        void (async () => {
          try {
            let matchesCount = 0;
            if (targetFile) {
              const text = await this.vfs.readFileAsText(targetFile);
              const lines = text.split('\n');
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                  this.terminal.writeOutput(
                    `---------- ${targetFile} (Ln ${i + 1}): ${lines[i]}\n`
                  );
                  matchesCount++;
                }
              }
            } else {
              const entries = await this.vfs.readdir(this.vfs.getCWD());
              for (const e of entries) {
                if (e.type === 'file') {
                  const text = await this.vfs.readFileAsText(e.path);
                  const lines = text.split('\n');
                  for (let i = 0; i < lines.length; i++) {
                    if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                      this.terminal.writeOutput(
                        `---------- ${e.name} (Ln ${i + 1}): ${lines[i]}\n`
                      );
                      matchesCount++;
                    }
                  }
                }
              }
            }
            if (matchesCount === 0) {
              this.terminal.writeOutput(`FIND: String "${query}" not found in target files.\n`);
            }
          } catch {
            this.terminal.writeError(`FIND: File not found or read error.\n`);
          }
        })();
      }
    });

    this.bus.subscribe('VFS:ATTRIB_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          try {
            const entries = await this.vfs.readdir(this.vfs.getCWD());
            let out = ``;
            for (const e of entries) {
              if (targetPath === '*.*' || e.name.toLowerCase().includes(targetPath.toLowerCase())) {
                const flag = e.type === 'directory' ? 'D    ' : 'A    ';
                out += `  ${flag}       ${e.path}\n`;
              }
            }
            this.terminal.writeOutput(out || `No attributes matched for ${targetPath}\n`);
          } catch {
            // Ignore
          }
        })();
      }
    });

    this.bus.subscribe('VFS:RECENT_REQUEST', () => {
      void (async () => {
        try {
          const entries = await this.vfs.readdir(this.vfs.getCWD());
          const sorted = entries.sort((a, b) => b.modifiedAt - a.modifiedAt);
          let out = `Recent Files in ${this.vfs.getCWD()}:\n`;
          for (const e of sorted.slice(0, 8)) {
            const dateStr = new Date(e.modifiedAt).toISOString().replace('T', ' ').substring(0, 16);
            out += `  ${dateStr}   ${e.name}\n`;
          }
          this.terminal.writeOutput(out);
        } catch {
          // Ignore
        }
      })();
    });

    this.bus.subscribe('VFS:PROJECTS_REQUEST', () => {
      void (async () => {
        try {
          const entries = await this.vfs.readdir('C:\\Users\\ReOS');
          const dirs = entries.filter(e => e.type === 'directory');
          let out = `Re\`OS Top-Level Projects in C:\\Users\\ReOS:\n`;
          if (dirs.length === 0) {
            out += `  (No project subfolders found. Type: mkdir <project_name> to create one)\n`;
          } else {
            for (const d of dirs) {
              out += `  <DIR>   ${d.name}\n`;
            }
          }
          this.terminal.writeOutput(out);
        } catch {
          // Ignore
        }
      })();
    });

    this.bus.subscribe('FILE:UPLOAD_REQUEST', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async () => {
        if (!input.files || input.files.length === 0) return;
        let count = 0;
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const text = await file.text();
          const targetPath = `${this.vfs.getCWD()}\\${file.name}`.replace(/\\+/g, '\\');
          await this.vfs.writeFile(targetPath, text);
          count++;
        }
        this.terminal.writeOutput(
          `[Upload Confirmation] Successfully imported ${count} local file(s) into ${this.vfs.getCWD()}!\n`
        );
      };
      input.click();
    });

    this.bus.subscribe('FILE:DOWNLOAD_REQUEST', event => {
      if (event.payload) {
        const { target, cwd } = event.payload as any;
        void (async () => {
          try {
            let fullPath = target;
            if (!fullPath.includes('\\') && !fullPath.includes('/')) {
              fullPath = `${cwd}\\${target}`.replace(/\\+/g, '\\');
            }
            const content = await this.vfs.readFileAsText(fullPath);
            const fileName = fullPath.split('\\').pop() || 'download.txt';
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.terminal.writeOutput(
              `[Download Confirmation] Download triggered for '${fileName}' to your local PC disk.\n`
            );
          } catch {
            this.terminal.writeError(`[Download Error] Cannot find file '${target}' in ${cwd}.\n`);
          }
        })();
      }
    });

    this.bus.subscribe('EDITOR:OPEN_REQUEST', event => {
      if (event.payload) {
        const { targetPath } = event.payload as any;
        void (async () => {
          try {
            const exists = await this.vfs.exists(targetPath);
            let text = '';
            if (!exists) {
              await this.vfs.writeFile(targetPath, '');
            } else {
              text = await this.vfs.readFileAsText(targetPath);
            }
            const ext = targetPath.split('.').pop()?.toLowerCase() || '';
            let lang = 'Text';
            if (ext === 'c') lang = 'C';
            else if (ext === 'cpp' || ext === 'h' || ext === 'hpp') lang = 'C++';
            else if (ext === 'py') lang = 'Python';
            else if (ext === 'java') lang = 'Java';
            else if (ext === 'md') lang = 'Markdown';

            this.editor.openBuffer(targetPath, text, lang);
            this.updateLayoutSplit(true);
          } catch (err: any) {
            this.terminal.writeError(`Cannot open file '${targetPath}': ${err?.message}\n`);
          }
        })();
      }
    });

    this.bus.subscribe('EDITOR:CLOSE', () => {
      const count = this.tabManager.getTabsCount();
      this.layout.setEditorOpen(count > 0);
    });

    this.bus.subscribe('TAB:SWITCH', event => {
      if (event.payload) {
        const { path } = event.payload as any;
        if (path) {
          this.editor.switchBuffer(path);
          this.layout.setEditorOpen(true);
        } else {
          this.layout.setEditorOpen(false);
        }
      }
    });

    // Central handler — use single source of truth
    this.bus.subscribe('EDITOR:OPEN', () => {
      this.layout.setEditorOpen(true);
    });

  }

  public async mount(rootElement: HTMLElement): Promise<void> {
    await this.vfs.init();

    rootElement.innerHTML = `
      <div class="reos-shell-container">
        <div id="reos-tab-bar" class="reos-tab-bar">
          <div id="reos-tab-strip" class="reos-tabs-strip"></div>
          <div class="reos-tab-bar-actions">
            <button id="reos-upload-btn" class="reos-action-btn" title="Upload files from your PC into current folder">⬆ Upload</button>
            <button id="reos-download-btn" class="reos-action-btn" title="Download active file or README to your PC">⬇ Download</button>
            <button id="reos-settings-btn" class="reos-action-btn" title="System Settings (Theme, Font, Auto-save)">⚙ Settings</button>
          </div>
        </div>
        <div id="reos-main-split" class="reos-main-split">
          <div id="reos-editor-zone" class="reos-editor-zone hidden">
            <div id="reos-monaco-container" class="reos-monaco-container"></div>
          </div>
          <div id="reos-terminal-zone" class="reos-terminal-zone">
            <div id="reos-terminal-container" class="reos-terminal-container"></div>
          </div>
        </div>
        <div id="reos-status-bar" class="reos-status-bar"></div>
        <div id="reos-settings-overlay" class="reos-settings-overlay"></div>
      </div>
    `;

    const tabContainer = rootElement.querySelector('#reos-tab-strip') as HTMLElement;
    const monacoContainer = rootElement.querySelector('#reos-monaco-container') as HTMLElement;
    const terminalContainer = rootElement.querySelector('#reos-terminal-container') as HTMLElement;
    const statusContainer = rootElement.querySelector('#reos-status-bar') as HTMLElement;
    const settingsContainer = rootElement.querySelector('#reos-settings-overlay') as HTMLElement;

    if (tabContainer) this.tabManager.mount(tabContainer);
    if (monacoContainer) this.editor.mount(monacoContainer);
    if (terminalContainer) this.terminal.mount(terminalContainer);
    if (statusContainer) this.statusBar.mount(statusContainer);
    if (settingsContainer) this.settingsOverlay.mount(settingsContainer);

    // Apply default theme
    this.theme.applyTheme(this.settings.getSettings().theme);

    // Bind action buttons
    const uploadBtn = rootElement.querySelector('#reos-upload-btn');
    if (uploadBtn)
      uploadBtn.addEventListener('click', () =>
        this.bus.publish('FILE:UPLOAD_REQUEST', { cwd: this.vfs.getCWD() })
      );

    const downloadBtn = rootElement.querySelector('#reos-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const active = this.editor.getActiveBuffer();
        const target = active ? active.path : 'README.txt';
        this.bus.publish('FILE:DOWNLOAD_REQUEST', { target, cwd: this.vfs.getCWD() });
      });
    }

    const settingsBtn = rootElement.querySelector('#reos-settings-btn');
    if (settingsBtn)
      settingsBtn.addEventListener('click', () => this.bus.publish('SETTINGS:TOGGLE'));


    // Drag and drop file upload over terminal
    rootElement.addEventListener('dragover', e => e.preventDefault());
    rootElement.addEventListener('drop', async e => {
      const paths = await this.fileTransfer.handleDropEvent(e, this.vfs.getCWD());
      if (paths.length > 0) {
        this.terminal.writeOutput(
          `[File Upload] Successfully uploaded ${paths.length} file(s) into ${this.vfs.getCWD()}:\n  ${paths.map(p => p.split('\\').pop()).join('\n  ')}\n`
        );
      }
    });

    this.layout.setEditorOpen(false);
  }

  // DEPRECATED — use LayoutState instead
  public updateLayoutSplit(hasActiveEditor: boolean): void {
    this.layout.setEditorOpen(hasActiveEditor);
  }
}
