import { User } from './Types.ts'

type listener = () => void

export class Store {
  private user: User | null = null;
  private listeners: listener[] = [];

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User | null) {
    if (this.user !== user) {
      this.user = user;
      this.notify();
    }
  }

  subscribe(listener: listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const appStore = new Store();
