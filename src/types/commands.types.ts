export interface IExecutionContext {
  cwd: string;
  terminalBufferId: string;
  activeEditorFile: string | null;
}

export interface ICommandResult {
  success: boolean;
  output?: string;
  error?: string;
  exitCode: number;
}

export interface IHelpDocument {
  readonly commandName: string;
  readonly description: string;
  readonly syntax: string;
  readonly examples: string[];
}
