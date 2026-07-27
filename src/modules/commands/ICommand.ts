import { IExecutionContext, ICommandResult, IHelpDocument } from '@types';

export interface ICommand {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;

  execute(
    args: string[],
    flags: Map<string, boolean>,
    context: IExecutionContext
  ): Promise<ICommandResult>;
  getHelpDocumentation(): IHelpDocument;
}
