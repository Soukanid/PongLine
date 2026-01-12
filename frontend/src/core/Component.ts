import { appStore } from './Store';

export abstract class BaseComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEvents();
  }

  protected setHtml(html: string) {
    this.innerHTML = html;
  }

  abstract render(): void;
  abstract addEvents(): void;
}
