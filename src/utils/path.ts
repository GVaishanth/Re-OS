export interface IPathResolver {
  toPosixPath(cmdPath: string): string;
  toCmdPath(posixPath: string): string;
  resolveAbsolute(baseCwd: string, targetPath: string): string;
}

export class PathUtil implements IPathResolver {
  public toPosixPath(cmdPath: string): string {
    return cmdPath.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/');
  }

  public toCmdPath(posixPath: string): string {
    const normalized = posixPath.replace(/\//g, '\\');
    return normalized.startsWith('\\') ? `C:${normalized}` : `C:\\${normalized}`;
  }

  public resolveAbsolute(baseCwd: string, targetPath: string): string {
    if (/^[a-zA-Z]:/.test(targetPath)) return targetPath;
    return `${baseCwd}\\${targetPath}`.replace(/\\+/g, '\\');
  }
}
