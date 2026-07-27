export type VFSNodeType = 'file' | 'directory';

export interface IVFSNodeMetadata {
  name: string;
  path: string;
  type: VFSNodeType;
  size: number;
  createdAt: number;
  modifiedAt: number;
  // Extended attributes for realistic OS behaviour
  readOnly?: boolean;
  protected?: boolean;
  hidden?: boolean;
  inRecycleBin?: boolean;
}

export interface IFileDescriptor {
  fd: number;
  path: string;
  flags: string;
  position: number;
}
