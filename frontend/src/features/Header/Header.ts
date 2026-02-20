import { BaseComponent } from "../../core/Component";
import { chatService } from "./../chat/ChatServices";
import  pongLineImage  from "../../../public/pongline.png";
import  searchIcon  from "../../../public/search.png";
import  notifIcon  from "../../../public/notif.png";
import  chatIcon  from "../../../public/chat.png";
import { headerService } from "./HeaderService"

export class Header extends BaseComponent {

  render() {
    this.setHtml(`
      <div class="flex-1 flex flex-row items-center h-20 w-full px-6">
        
        <img id="pongLine" src="${pongLineImage}" class="h-8 w-40 cursor-pointer hover:opacity-80 transition-opacity" > 

        <div class="ml-auto flex flex-row items-center gap-6">
          
          <div class="relative">
            
            <div class="flex border-b border-retro/50 items-center w-80 focus-within:border-retro transition-colors">
              <img src="${searchIcon}" class="m-2 w-7 h-7 " alt="Search" />
              <input 
                id="user-search" 
                type="text" 
                autocomplete="off"
                spellcheck="false"
                class="flex-1 focus:outline-none bg-transparent font-mono text-retro placeholder-retro/50 py-2 text-sm" 
                placeholder="Find a player..."
              >
            </div>

            <div id="search-results"
                class="absolute top-full left-0 w-full mt-1 bg-black border border-retro z-50 hidden max-h-60 overflow-y-auto shadow-lg">
            </div>

          </div> <div class="flex gap-4">
            <img id="chatPage" src="${chatIcon}" class="h-8 w-8 cursor-pointer hover:scale-110 transition-transform" > 
            <div class="relative" id="notif-container">
               <button id="notif-btn" class="relative hover:scale-110 transition-transform">
                  <img src="${notifIcon}" class="h-8 w-8 cursor-pointer">
               </button>

               <div id="notif-dropdown" class="absolute right-0 top-full mt-4 w-80 bg-black border border-retro z-50 hidden flex-col">
                  <div id="notif-list" class="max-h-80 overflow-y-auto"> </div>
               </div>
          </div>

        </div> </div>
    `);
  }

  private  debounceTimer: any = null;
  private notifcounter : number = 0;
  private isNotifOpen : boolean = false;

  private handleNotification = (data: any) => {
      this.notifcounter++;
      //[soukaina] I am gonna use Numbers
      // this.updateRedDot();

  }

  async connectedCallback()
  {
      super.connectedCallback?.();
      
      chatService.onNotification(this.handleNotification);
      const list = await headerService.fetchUnreadNotifications();

      if (list)
      {
         this.notifcounter = list.length;
      }
  }

  // disconnectedCallback() {
  //
  //     chatService.notificationListeners = chatService.notificationListeners.filter(cb => cb !== this.handleNotification);
  // }
  


  async toggleNotifications()
  {
      const dropdown = this.querySelector('#notif-dropdown') as HTMLElement;
      const listContainer = this.querySelector('#notif-list') as HTMLElement;
      
      if (!dropdown || !listContainer)
        return;

      this.isNotifOpen = !this.isNotifOpen;

      if (this.isNotifOpen)
      {
          dropdown.classList.remove('hidden');
          
          const notifList = await headerService.fetchUnreadNotifications();
          this.renderNotificationItems(notifList, listContainer);
          this.notifcounter = 0;
          headerService.maskAsRead();
      }
      else 
          dropdown.classList.add('hidden');
  }

  renderNotificationItems(notifs: any[], container: HTMLElement)
  {
      if (notifs.length === 0)
      {
          container.innerHTML = '<div class="p-4 text-center text-retro/50 text-xs font-mono">No new notifications</div>';
          return;
      }

      container.innerHTML = '';
      notifs.forEach(n => {
          const item = document.createElement('div');
          item.className = "p-2 border-b border-retro/10 hover:bg-retro/10 transition-colors flex flex-col";
          
          let message = n.content;

          item.innerHTML = `
             <div class="text-sm text-retro font-mono">${message}</div>
             <div class="text-sm text-retro text-right">${new Date(n.createdAt).toLocaleTimeString()}</div>
          `;
          container.appendChild(item);
      });
  }

  async searchUser(str: String, container: HTMLElement)
  {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/search?str=${str}`);
        const results = await res.json();
        this.renderFriendList(results, container);
    } catch (err) {
        console.error("Search failed", err);
    }
  }
  
  renderFriendList(results: {id: number, username: string}[], container: HTMLElement)
  {
    container.innerHTML = '';

    if (results.length === 0)
    {
      container.innerHTML = `<div class="p-3 text-retro/50 text-sm font-mono">No users found</div>`;
      container.classList.remove('hidden');
      return;
    }
    
    results.forEach(u => {

      const userItem = document.createElement('div');
      userItem.className = "flex items-center p-3 text-retro font-mono hover:bg-retro hover:text-black";

      userItem.innerHTML = `
          <span class="font-mono font-bold text-sm pointer-events-none">${u.username}</span> 
      `;

      userItem.addEventListener('click', () => {
          
          window.history.pushState({}, "", `/profile?username=${u.username}`);
          const navEvent = new PopStateEvent('popstate');
          window.dispatchEvent(navEvent);
          container.classList.add('hidden');

          const input = this.querySelector('#user-search') as HTMLInputElement;
          if (input)
            input.value = '';
      });

      container.appendChild(userItem);
      });
    container.classList.remove('hidden');
  }


  addEvents(): void
  {
    const searchInput = this.querySelector('#user-search') as HTMLInputElement;
    const resultsContainer = this.querySelector('#search-results') as HTMLElement;

    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.trim();

      if (this.debounceTimer)
        clearTimeout(this.debounceTimer);

      // if no input we will hide the div
      if (query.length < 3)
      {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
      }
      else
      {
        // here we use the debouncer 
        this.debounceTimer = setTimeout(() => {
          this.searchUser(query, resultsContainer);}
          , 300);
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.contains(e.target as Node))
        resultsContainer.classList.add('hidden');

      const notifDropdown = this.querySelector('#notif-dropdown');
      const notifContainer = this.querySelector('#notif-container');
      if (this.isNotifOpen && notifContainer)
      {
        notifDropdown?.classList.add('hidden');
        this.isNotifOpen = false;
      }
    });

    const ponglineLink = this.querySelector('#pongLine') as HTMLImageElement;

    ponglineLink.addEventListener('click', () => {
      window.router.navigateTo("/profile"); 
    });

    const chatLink = this.querySelector('#chatPage') as HTMLImageElement;

    chatLink.addEventListener('click', () => {
      window.router.navigateTo("/chat"); 
    });

    const notifBtn = this.querySelector('#notif-btn');
      notifBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this.toggleNotifications();
    });
  }
}

customElements.define("app-header", Header);
