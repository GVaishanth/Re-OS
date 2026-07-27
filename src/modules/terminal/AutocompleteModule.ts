import { VFSModule } from '@modules/filesystem/VFSModule';

export interface IAutocompleteModule {
  suggest(partialInput: string, cwd: string, vfs?: VFSModule): Promise<string[]>;
}

const BUILTIN_COMMANDS = [
  'cd',
  'chdir',
  'dir',
  'ls',
  'mkdir',
  'md',
  'del',
  'rm',
  'erase',
  'copy',
  'cp',
  'move',
  'mv',
  'ren',
  'rename',
  'clr',
  'cls',
  'type',
  'cat',
  'edit',
  'run',
  'history',
  'version',
  'ver',
  'help',
  'echo',
  'tree',
  'find',
  'grep',
  'attrib',
  'date',
  'time',
  'exit',
  'recent',
  'projects',
  'theme',
  'settings',
  'about',
  'upload',
  'download'
];

export class AutocompleteModule implements IAutocompleteModule {
  public async suggest(partialInput: string, cwd: string, vfs?: VFSModule): Promise<string[]> {
    const trimmed = partialInput.trimStart();
    if (!trimmed) return BUILTIN_COMMANDS;

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      const lower = parts[0].toLowerCase();
      return BUILTIN_COMMANDS.filter(cmd => cmd.startsWith(lower));
    } else {
      if (!vfs) return [];
      const cmd = parts[0];
      const prefix = parts[parts.length - 1].toLowerCase();
      try {
        const entries = await vfs.readdir(cwd);
        const matches = entries
          .map(e => e.name)
          .filter(name => name.toLowerCase().startsWith(prefix));
        return matches.map(match => `${cmd} ${match}`);
      } catch {
        return [];
      }
    }
  }
}
