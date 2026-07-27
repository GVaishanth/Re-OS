import { ICommand } from './ICommand';
import { IExecutionContext, ICommandResult, IHelpDocument } from '@types';
import { ReOSBus } from '@core/ReOSBus';

export class AboutCommandModule implements ICommand {
  public readonly name = 'about';
  public readonly aliases = [];
  public readonly description =
    'Displays information about Re`OS architecture and product philosophy.';
  private bus: ReOSBus = ReOSBus.getInstance();

  public async execute(
    _args: string[],
    _flags: Map<string, boolean>,
    _context: IExecutionContext
  ): Promise<ICommandResult> {
    const text = `================================================================
                           Re\`OS v1.0.0
================================================================
A 100% Local-First, Browser-Native Development Operating Environment.

Philosophy & Exact Interaction Layout:
  - 70% Windows CMD (Permanent Command Prompt controller)
  - 20% VS Code Modal Editor (Pure code buffer editing)
  - 10% Chrome File Tabs (Exclusively for open code files)

Key Highlights:
  - Zero cloud compilation, zero external backend dependencies
  - WebAssembly local runtimes (C/C++ Clang, Python Pyodide, Java JVM)
  - Origin Private File System (OPFS) & IndexedDB persistence
  - Smart Error Navigation clicking exact diagnostics (Ln:Col)
  - Universal double-click file:// support and GitHub Pages compatible
================================================================\n`;
    this.bus.publish('EXEC:STDOUT_CHUNK', { text });
    return { success: true, exitCode: 0 };
  }

  public getHelpDocumentation(): IHelpDocument {
    return {
      commandName: this.name,
      description: this.description,
      syntax: `about`,
      examples: [`about`]
    };
  }
}
