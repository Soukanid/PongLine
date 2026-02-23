import { appStore } from "./Store";

export abstract class BaseComponent extends HTMLElement {
  private unsubscribe?: ()=>void;

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEvents();
    this.unsubscribe = appStore.subscribe(()=>{
    })
  }

  disconnectedCallback(){
    this.unsubscribe?.();
  }

  protected setHtml(html: string) {
    this.innerHTML = html;
  }

  abstract render(): void;
  abstract addEvents(): void;
}
