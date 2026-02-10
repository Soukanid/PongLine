import { BaseComponent } from "../core/Component";
import  pongLineImage  from "../../public/pongline.png";
import  searchIcon  from "../../public/search.png";
import  notifIcon  from "../../public/notif.png";
import  chatIcon  from "../../public/chat.png";

export class Header extends BaseComponent {
  render() {
    this.setHtml(`
      <div class="flex-1 flex flex-row   items-center  h-20 w-full mr-auto">
        <a href="/"> 
          <img src="${pongLineImage}" class="h-8 w-40" > </img>
        </a>
        <div class="flex flex-row ml-auto items-center gap-6">
          <div class="w-100 flex border-b border-retro/50">
            <img src="${searchIcon}" class="items-center m-2  w-8 h-8" alt="Search" />
            <input 
              id="friend-search" 
              type="text" 
              autocomplete=off
              class="flex-1 focus:outline-none bg-transparent font-mono text text-retro" 
            >
          </div>
          <img src="${chatIcon}" class="h-8 w-8" > </img>
          <img src="${notifIcon}" class="h-8 w-8" > </img>
        </div>
      </div>
    `);
  }

  addEvents(): void {

  }
}

customElements.define("app-header", Header);
