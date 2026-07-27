import { ReOSBus } from './ReOSBus';
import { SYSTEM_CONSTANTS } from './Constants';
import { CapabilityProfiler } from './CapabilityProfiler';
import { AppShellModule } from '@modules/shell/AppShellModule';

export interface IAppController {
  bootstrap(viewportId: string): Promise<void>;
  executeBootSequence(): Promise<void>;
}

export class AppController implements IAppController {
  private bus: ReOSBus;
  private shell?: AppShellModule;

  constructor() {
    this.bus = ReOSBus.getInstance();
  }

  public async bootstrap(viewportId: string): Promise<void> {
    await CapabilityProfiler.detectCapabilities();

    const rootElement = document.getElementById(viewportId);
    if (!rootElement) {
      throw new Error(`Fatal: Root viewport element #${viewportId} not found in DOM.`);
    }

    this.shell = new AppShellModule();
    await this.shell.mount(rootElement);
    await this.executeBootSequence();
  }

  public async executeBootSequence(): Promise<void> {
    this.bus.publish('APP:BOOT_START');
    for (const step of SYSTEM_CONSTANTS.BOOT_SEQUENCE_STEPS) {
      this.bus.publish('EXEC:STDOUT_CHUNK', { text: `${step}\n` });
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    this.bus.publish('CMD:CLEAR');
    this.bus.publish('APP:BOOT_COMPLETE');
  }
}
