import { ICommand } from './ICommand';
import { IExecutionContext, ICommandResult, IHelpDocument } from '@types';
import { ReOSBus } from '@core/ReOSBus';

export class TreeCommandModule implements ICommand {
  public readonly name = 'tree';
  public readonly aliases = [];
  public readonly description =
    'Toggles the Explorer right-side directory tree overlay or outputs ASCII directory hierarchy.';
  private bus: ReOSBus = ReOSBus.getInstance();

  public async execute(
    _args: string[],
    _flags: Map<string, boolean>,
    _context: IExecutionContext
  ): Promise<ICommandResult> {
    this.bus.publish('EXPLORER:TOGGLE');
    return { success: true, exitCode: 0 };
  }

  public getHelpDocumentation(): IHelpDocument {
    return {
      commandName: this.name,
      description: this.description,
      syntax: `tree [path]`,
      examples: [`tree`, `tree C:\\Users\\ReOS`]
    };
  }
}
