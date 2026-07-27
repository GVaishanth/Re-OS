import { ReOSBus } from '@core/ReOSBus';
import { IVFSNodeMetadata, IFileDescriptor } from '@types';
import { StorageAdapterModule } from './StorageAdapterModule';

export interface IVFSModule {
  getCWD(): string;
  setCWD(newPath: string): Promise<boolean>;
  readdir(path?: string): Promise<IVFSNodeMetadata[]>;
  readFile(path: string): Promise<Uint8Array>;
  readFileAsText(path: string): Promise<string>;
  writeFile(path: string, data: Uint8Array | string): Promise<boolean>;
  mkdir(path: string): Promise<boolean>;
  unlink(path: string): Promise<boolean>;
  open(path: string, flags: string): Promise<IFileDescriptor>;
  close(fd: number): Promise<boolean>;
  exists(path: string): Promise<boolean>;
  isDirectory(path: string): Promise<boolean>;
  init(): Promise<void>;
}

interface InternalVFSNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  size: number;
  createdAt: number;
  modifiedAt: number;
}

export class VFSModule implements IVFSModule {
  private bus: ReOSBus;
  private storageAdapter: StorageAdapterModule;
  private cwd: string = 'C:\\Users\\ReOS';
  private nodes: Map<string, InternalVFSNode> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.bus = ReOSBus.getInstance();
    this.storageAdapter = new StorageAdapterModule();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    await this.storageAdapter.init();

    // Create root directories with lowerCase keys
    this.nodes.set('c:\\', {
      name: 'C:',
      path: 'C:\\',
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });
    this.nodes.set('c:\\users', {
      name: 'Users',
      path: 'C:\\Users',
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });
    this.nodes.set('c:\\users\\reos', {
      name: 'ReOS',
      path: 'C:\\Users\\ReOS',
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });

    const savedFiles = await this.storageAdapter.loadVFSState();
    if (savedFiles && savedFiles.size > 0) {
      for (const [path, data] of savedFiles.entries()) {
        const norm = this.normalizePath(path);
        const name = norm.split('\\').pop() || '';
        this.ensureParentDirs(norm);
        this.nodes.set(norm.toLowerCase(), {
          name,
          path: norm,
          type: 'file',
          content: data.content,
          size: new Blob([data.content]).size,
          createdAt: data.createdAt,
          modifiedAt: data.modifiedAt
        });
      }
    } else {
      await this.writeFile(
        'C:\\Users\\ReOS\\main.cpp',
        `#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cout << "Enter your name for Re\`OS C++ test: ";
    std::cin >> name;
    if (name == "Admin" || name == "Engineer") {
        std::cout << "Welcome Admin! High privileges active." << std::endl;
    } else {
        std::cout << "Welcome to Re\`OS C++ Engine, " << name << "!" << std::endl;
    }
    return 0;
}
`
      );
      await this.writeFile(
        'C:\\Users\\ReOS\\hello.py',
        `import sys

print("Re\`OS Local Python Runtime - Python " + sys.version.split()[0])
name = input("Enter your name for Re\`OS test: ")
age = int(input("Enter your age: "))

if age >= 18:
    print(f"Access Granted to {name} (Adult: {age} yrs)")
else:
    print(f"Restricted Access for {name} (Minor: {age} yrs)")
`
      );
      await this.writeFile(
        'C:\\Users\\ReOS\\Main.java',
        `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Re\`OS Java JVM Execution inside WebAssembly!");
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter username: ");
        String user = scanner.nextLine();
        System.out.println("Java JVM running for: " + user);
    }
}
`
      );
      await this.writeFile(
        'C:\\Users\\ReOS\\README.txt',
        `Welcome to Re\`OS!

Re\`OS is a local-first development operating environment engineered around:
- 70% Windows Command Prompt (Permanent terminal core)
- 20% VS Code Modal Editor (Buffer editing without bloat)
- 10% Chrome File Tabs (Exclusively open source files)

Try commands like:
  dir
  edit main.cpp
  run main.cpp
  run hello.py
  clr
  help
  version
`
      );
    }

    this.initialized = true;
  }

  private normalizePath(path: string): string {
    let p = path.replace(/\//g, '\\');
    if (!/^[a-zA-Z]:\\/.test(p)) {
      if (p.startsWith('\\')) {
        p = 'C:' + p;
      } else {
        p = this.cwd + (this.cwd.endsWith('\\') ? '' : '\\') + p;
      }
    }
    const parts = p.split('\\');
    const stack: string[] = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (stack.length > 1) stack.pop();
      } else {
        stack.push(part);
      }
    }
    return stack.join('\\');
  }

  private ensureParentDirs(path: string): void {
    const parts = path.split('\\');
    let curr = parts[0] + '\\';
    if (!this.nodes.has(curr.toLowerCase())) {
      this.nodes.set(curr.toLowerCase(), {
        name: parts[0] + '\\',
        path: curr,
        type: 'directory',
        size: 0,
        createdAt: Date.now(),
        modifiedAt: Date.now()
      });
    }
    for (let i = 1; i < parts.length - 1; i++) {
      curr = curr + (curr.endsWith('\\') ? '' : '\\') + parts[i];
      if (!this.nodes.has(curr.toLowerCase())) {
        this.nodes.set(curr.toLowerCase(), {
          name: parts[i],
          path: curr,
          type: 'directory',
          size: 0,
          createdAt: Date.now(),
          modifiedAt: Date.now()
        });
      }
    }
  }

  public getCWD(): string {
    return this.cwd;
  }

  public async setCWD(newPath: string): Promise<boolean> {
    const norm = this.normalizePath(newPath);
    const key = norm.toLowerCase();
    const node = this.nodes.get(key);
    if (!node || node.type !== 'directory') {
      return false;
    }
    this.cwd = node.path;
    this.bus.publish('VFS:CWD_CHANGED', { cwd: this.cwd });
    return true;
  }

  public async readdir(path?: string): Promise<IVFSNodeMetadata[]> {
    const target = this.normalizePath(path || this.cwd).toLowerCase();
    const prefix = target + (target.endsWith('\\') ? '' : '\\');
    const results: IVFSNodeMetadata[] = [];

    for (const [key, node] of this.nodes.entries()) {
      if (key === target) continue;
      if (key.startsWith(prefix)) {
        const remainder = key.substring(prefix.length);
        if (!remainder.includes('\\')) {
          results.push({
            name: node.name,
            path: node.path,
            type: node.type,
            size: node.size,
            createdAt: node.createdAt,
            modifiedAt: node.modifiedAt
          });
        }
      }
    }
    return results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  public async exists(path: string): Promise<boolean> {
    const norm = this.normalizePath(path).toLowerCase();
    return this.nodes.has(norm);
  }

  public async isDirectory(path: string): Promise<boolean> {
    const norm = this.normalizePath(path).toLowerCase();
    const node = this.nodes.get(norm);
    return node ? node.type === 'directory' : false;
  }

  public async readFileAsText(path: string): Promise<string> {
    const norm = this.normalizePath(path).toLowerCase();
    const node = this.nodes.get(norm);
    if (!node || node.type !== 'file') {
      throw new Error(`File not found: ${path}`);
    }
    return node.content || '';
  }

  public async readFile(path: string): Promise<Uint8Array> {
    const text = await this.readFileAsText(path);
    return new TextEncoder().encode(text);
  }

  public async writeFile(path: string, data: Uint8Array | string): Promise<boolean> {
    const norm = this.normalizePath(path);
    const key = norm.toLowerCase();
    const content = typeof data === 'string' ? data : new TextDecoder().decode(data);
    const name = norm.split('\\').pop() || '';

    this.ensureParentDirs(norm);

    const isCreated = !this.nodes.has(key);
    const now = Date.now();
    const existing = this.nodes.get(key);

    this.nodes.set(key, {
      name,
      path: norm,
      type: 'file',
      content,
      size: new Blob([content]).size,
      createdAt: existing ? existing.createdAt : now,
      modifiedAt: now
    });

    this.persistAllFiles();

    if (isCreated) {
      this.bus.publish('VFS:FILE_CREATED', { path: norm });
    } else {
      this.bus.publish('VFS:FILE_MODIFIED', { path: norm });
    }
    return true;
  }

  public async mkdir(path: string): Promise<boolean> {
    const norm = this.normalizePath(path);
    const key = norm.toLowerCase();
    if (this.nodes.has(key)) {
      return false;
    }
    this.ensureParentDirs(norm);
    const name = norm.split('\\').pop() || '';
    this.nodes.set(key, {
      name,
      path: norm,
      type: 'directory',
      size: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now()
    });
    return true;
  }

  public async unlink(path: string): Promise<boolean> {
    const norm = this.normalizePath(path);
    const key = norm.toLowerCase();
    if (!this.nodes.has(key)) {
      return false;
    }
    this.nodes.delete(key);
    this.persistAllFiles();
    this.bus.publish('VFS:FILE_DELETED', { path: norm });
    return true;
  }

  public async open(path: string, flags: string): Promise<IFileDescriptor> {
    const norm = this.normalizePath(path);
    return { fd: 1, path: norm, flags, position: 0 };
  }

  public async close(_fd: number): Promise<boolean> {
    return true;
  }

  private persistAllFiles(): void {
    const filesToSave = new Map<
      string,
      { content: string; createdAt: number; modifiedAt: number }
    >();
    for (const node of this.nodes.values()) {
      if (node.type === 'file' && typeof node.content === 'string') {
        filesToSave.set(node.path, {
          content: node.content,
          createdAt: node.createdAt,
          modifiedAt: node.modifiedAt
        });
      }
    }
    void this.storageAdapter.saveVFSState(filesToSave);
  }
}
