export class Store {
  private state: any = {};
  private listeners: Function[] = [];

  getState() { return this.state; }

  setState(newState: any) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(l => l(this.state));
  }

  subscribe(fn: Function) {
    this.listeners.push(fn);
  }
}
export const appStore = new Store();
