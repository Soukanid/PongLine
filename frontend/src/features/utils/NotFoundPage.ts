import { BaseComponent } from "../../core/Component"

export class NotFoundPage extends BaseComponent {

  render(): void {
   const container = document.createElement('div')
  container.id = "Notfound"
  container.innerHTML = " <h1> 404 PAGE NOT FOUND </h1>"
  this.innerHTML = container.innerHTML
  }

  addEvents(): void {
      
  }
  }

  customElements.define("not-found-page", NotFoundPage);