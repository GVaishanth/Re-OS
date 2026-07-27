export type VFSNodeType = 'file' | 'directory';

export interface IVFSNodeMetadata {
  name: string;
  path: string;
  type: VFSNodeType;
  size: number;
  createdAt: number;
  modifiedAt: number;
}

export interface IFileDescriptor {
  fd: number;
  path: string;
  flags: string;
  position: number;
}
