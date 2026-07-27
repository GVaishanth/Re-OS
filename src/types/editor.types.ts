export interface IEditorBuffer {
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  cursor: { line: number; column: number };
}

export interface IWorkspaceTab {
  id: string;
  path: string;
  label: string;
  isDirty: boolean;
  isActive: boolean;
}
