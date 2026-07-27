import { describe, it, expect, beforeEach } from 'vitest';
import { VFSModule } from '@modules/filesystem/VFSModule';
import { CommandDispatcher } from '@modules/commands/CommandDispatcher';
import { LanguageDetectionModule } from '@modules/execution/LanguageDetectionModule';
import {
  CdCommandModule, DirCommandModule, MkdirCommandModule, DelCommandModule,
  CopyCommandModule, MoveCommandModule, RenCommandModule, ClrCommandModule,
  TypeCommandModule, EditCommandModule, RunCommandModule, VersionCommandModule,
  HelpCommandModule
} from '@modules/commands';

describe('Re`OS Core System Integration Tests', () => {
  let vfs: VFSModule;
  let dispatcher: CommandDispatcher;
  let detector: LanguageDetectionModule;

  beforeEach(async () => {
    vfs = new VFSModule();
    await vfs.init();

    dispatcher = new CommandDispatcher();
    dispatcher.registerCommand(new CdCommandModule());
    dispatcher.registerCommand(new DirCommandModule());
    dispatcher.registerCommand(new MkdirCommandModule());
    dispatcher.registerCommand(new DelCommandModule());
    dispatcher.registerCommand(new CopyCommandModule());
    dispatcher.registerCommand(new MoveCommandModule());
    dispatcher.registerCommand(new RenCommandModule());
    dispatcher.registerCommand(new ClrCommandModule());
    dispatcher.registerCommand(new TypeCommandModule());
    dispatcher.registerCommand(new EditCommandModule());
    dispatcher.registerCommand(new RunCommandModule());
    dispatcher.registerCommand(new VersionCommandModule());
    dispatcher.registerCommand(new HelpCommandModule(() => dispatcher));

    detector = new LanguageDetectionModule();
  });

  it('should initialize VFS with default sample workspace', async () => {
    const entries = await vfs.readdir('C:\\Users\\ReOS');
    const names = entries.map(e => e.name);
    expect(names).toContain('main.cpp');
    expect(names).toContain('hello.py');
    expect(names).toContain('Main.java');
    expect(names).toContain('README.txt');
  });

  it('should create directories and files across the virtual filesystem', async () => {
    await vfs.mkdir('C:\\Users\\ReOS\\projects\\demo');
    await vfs.writeFile('C:\\Users\\ReOS\\projects\\demo\\app.c', '#include <stdio.h>\nint main() { return 0; }');
    
    expect(await vfs.exists('C:\\Users\\ReOS\\projects\\demo\\app.c')).toBe(true);
    const content = await vfs.readFileAsText('C:\\Users\\ReOS\\projects\\demo\\app.c');
    expect(content).toContain('#include <stdio.h>');
  });

  it('should resolve POSIX/Linux command aliases and built-in execution', async () => {
    const context = { cwd: 'C:\\Users\\ReOS', terminalBufferId: 'cmd-1', activeEditorFile: null };
    
    // Test `pwd`
    const pwdRes = await dispatcher.dispatch('pwd', context);
    expect(pwdRes.success).toBe(true);
    expect(pwdRes.output).toBe('C:\\Users\\ReOS');

    // Test `ls` -> `dir`
    const lsRes = await dispatcher.dispatch('ls', context);
    expect(lsRes.success).toBe(true);
  });

  it('should suggest corrections using Levenshtein distance for typos', async () => {
    const context = { cwd: 'C:\\Users\\ReOS', terminalBufferId: 'cmd-1', activeEditorFile: null };
    
    const typoRes = await dispatcher.dispatch('mkdr new_folder', context);
    expect(typoRes.success).toBe(false);
    expect(typoRes.error).toContain('Did you mean:\nmkdir');
  });

  it('should deterministically detect programming language using 5-step heuristics', async () => {
    // Check via extensions
    const resCpp = await detector.detect('test.cpp', 'C:\\Users\\ReOS');
    expect(resCpp.language).toBe('C++');
    expect(resCpp.confidence).toBe('HIGH');

    // Check via content heuristics when extension or buffer is tested
    await vfs.writeFile('C:\\Users\\ReOS\\script', 'import sys\nprint("hello")');
    const resPy = await detector.detect('C:\\Users\\ReOS\\script', 'C:\\Users\\ReOS', vfs);
    expect(resPy.language).toBe('Python');
    expect(resPy.confidence).toBe('HIGH');
  });
});
