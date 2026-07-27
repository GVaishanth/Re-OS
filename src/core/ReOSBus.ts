import { ReOSEventType, IReOSEvent, EventCallback } from '@types';

export interface IReOSBus {
  subscribe<T = any>(eventType: ReOSEventType, callback: EventCallback<T>): () => void;
  publish<T = any>(eventType: ReOSEventType, payload?: T): void;
}

export class ReOSBus implements IReOSBus {
  private static instance: ReOSBus;
  private listeners: Map<ReOSEventType, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): ReOSBus {
    if (!ReOSBus.instance) {
      ReOSBus.instance = new ReOSBus();
    }
    return ReOSBus.instance;
  }

  public subscribe<T = any>(eventType: ReOSEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public publish<T = any>(eventType: ReOSEventType, payload?: T): void {
    const event: IReOSEvent<T> = {
      type: eventType,
      payload,
      timestamp: Date.now()
    };
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }
  }
}
