import { ICommand } from './ICommand';
import { IExecutionContext, ICommandResult, IHelpDocument } from '@types';
import { ReOSBus } from '@core/ReOSBus';

export class MkdirCommandModule implements ICommand {
  public readonly name = 'mkdir';
  public readonly aliases = ['md'];
  public readonly description =
    'Creates new directories or nested directory paths inside the virtual filesystem.';
  private bus: ReOSBus = ReOSBus.getInstance();

  public async execute(
    args: string[],
    _flags: Map<string, boolean>,
    _context: IExecutionContext
  ): Promise<ICommandResult> {
    if (args.length === 0) {
      const errMsg = 'The syntax of the command is incorrect.\nSyntax: mkdir <directory_name>\n';
      this.bus.publish('EXEC:STDERR_CHUNK', { text: errMsg });
      return { success: false, exitCode: 1, error: errMsg };
    }
    const targetPath = args.join(' ');
    this.bus.publish('VFS:MKDIR_REQUEST', { targetPath });
    return { success: true, exitCode: 0 };
  }

  public getHelpDocumentation(): IHelpDocument {
    return {
      commandName: this.name,
      description: this.description,
      syntax: `mkdir <directory_name> [or] md <directory_name>`,
      examples: [`mkdir src`, `mkdir projects\\cpp_test\\include`]
    };
  }
}
