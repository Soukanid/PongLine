import { appStore } from "./Store";

export abstract class BaseComponent extends HTMLElement {
  private unsubscribe?: ()=>void;

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEvents();
      this.update();
    this.unsubscribe = appStore.subscribe(()=>{
      this.update();
    })
  }

  disconnectedCallback(){
    this.unsubscribe?.();
  }

  protected setHtml(html: string) {
    this.innerHTML = html;
  }

  abstract update(): void;
  abstract render(): void;
  abstract addEvents(): void;
}
