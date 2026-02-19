import { BaseComponent } from "../../core/Component";
import { chatService } from "./../chat/ChatServices";
import  pongLineImage  from "../../../public/pongline.png";
import  searchIcon  from "../../../public/search.png";
import  notifIcon  from "../../../public/notif.png";
import  chatIcon  from "../../../public/chat.png";

export class Header extends BaseComponent {

  render() {
    this.setHtml(`
      <div class="flex-1 flex flex-row items-center h-20 w-full px-6">
        
        <a href="/" data-link> 
          <img src="${pongLineImage}" class="h-8 w-40 hover:opacity-80 transition-opacity" > 
        </a>

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
            <a href="/chat" data-link> 
              <img src="${chatIcon}" class="h-8 w-8 cursor-pointer hover:scale-110 transition-transform" > 
            </a>
             <img src="${notifIcon}" class="h-8 w-8 cursor-pointer hover:scale-110 transition-transform"> 
          </div>

        </div> </div>
    `);
    this.addEvents();
  }

  private  debounceTimer: any = null;
  private notifcounter : number = 0;
  private isNotifOpen : boolean = false;

  private handleNotification = (data: any) => {
      this.notifcounter++;
      this.updateRedDot();

  }

  connectedCallback()
  {
      super.connectedCallback?.();
      
      chatService.onNotification(this.handleNotification);
      this.fetchUnreadNotifications();
  }

  // disconnectedCallback()
  // {
  //     chatService.notificationListeners = chatService.notificationListeners.filter(cb => cb !== this.handleNotification);
  // }
  
  updateRedDot() {
      const ping = this.querySelector('#red-dot span:first-child');
      const dot = this.querySelector('#red-dot span:last-child');
      
      if (this.notifcounter > 0) {
          ping?.classList.remove('hidden');
          dot?.classList.remove('hidden');
      } else {
          ping?.classList.add('hidden');
          dot?.classList.add('hidden');
      }
  }

  async fetchUnreadNotifications() {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/notifications`, {
             headers: { 'Authorization': 'include' }
          });
          if (res.ok) {
              const list = await res.json();
              this.notifcounter = list.length;
              this.updateRedDot();
          }
      } catch (e) {
          console.error("Failed to fetch notifications", e);
      }
  }

  async toggleNotifications() {
      const dropdown = this.querySelector('#notif-dropdown');
      const listContainer = this.querySelector('#notif-list');
      
      if (!dropdown || !listContainer) return;

      this.isNotifOpen = !this.isNotifOpen;

      if (this.isNotifOpen) {
          dropdown.classList.remove('hidden');
          
          // 1. Load actual data
          listContainer.innerHTML = '<div class="p-4 text-center text-retro/50 text-xs animate-pulse">Loading...</div>';
          
          try {
              // Fetch latest list
              const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/notifications`); // Endpoint to get last 10 notifs
              const notifs = await res.json();
              this.renderNotificationItems(notifs, listContainer);
              
              this.notifcounter = 0;
              this.updateRedDot();
              await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/notifications/mark-read`, { method: 'POST' });

          } catch (e) {
              listContainer.innerHTML = '<div class="p-4 text-center text-red-500 text-xs">Failed to load</div>';
          }

      } else {
          dropdown.classList.add('hidden');
      }
  }

  renderNotificationItems(notifs: any[], container: HTMLElement) {
      if (notifs.length === 0) {
          container.innerHTML = '<div class="p-4 text-center text-retro/50 text-xs font-mono">No new notifications</div>';
          return;
      }

      container.innerHTML = '';
      notifs.forEach(n => {
          const item = document.createElement('div');
          item.className = "p-3 border-b border-retro/10 hover:bg-retro/10 transition-colors flex flex-col gap-2";
          
          // Parse content if it's JSON string, or use directly
          let message = n.content;
          let extraData = {};
          try { 
             const parsed = JSON.parse(n.content); 
             if (parsed.message) message = parsed.message;
             extraData = parsed;
          } catch(e) {}

          item.innerHTML = `
             <div class="text-sm text-retro font-mono break-words">${message}</div>
             <div class="text-[10px] text-retro/50 text-right">${new Date(n.created_at).toLocaleTimeString()}</div>
          `;

          // Add Buttons for Friend Requests / Game Invites
          if (n.type === 'FRIEND_REQ') {
             const btnGroup = document.createElement('div');
             btnGroup.className = "flex gap-2 justify-end mt-1";
             btnGroup.innerHTML = `
                <button class="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/30 hover:bg-green-800">Accept</button>
                <button class="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded border border-red-500/30 hover:bg-red-800">Decline</button>
             `;
             // Add click listeners for Accept/Decline here...
             item.appendChild(btnGroup);
          }

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
    // remove tha data from the last one
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


  addEvents(): void {
    const searchInput = this.querySelector('#user-search') as HTMLInputElement;
    const resultsContainer = this.querySelector('#search-results') as HTMLElement;

    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.trim();

      //if the previous times is still active clear it
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
      } });

    // to close the search dropdown when u click outside
    document.addEventListener('click', (e) => {
    // we avoid clicks inside the parent dev "header"
    if (!this.contains(e.target as Node))
        resultsContainer.classList.add('hidden');

    const notifDropdown = this.querySelector('#notif-dropdown');
    const notifContainer = this.querySelector('#notif-container');
    if (this.isNotifOpen && notifContainer && !notifContainer.contains(target))
    {
      notifDropdown?.classList.add('hidden');
      this.isNotifOpen = false;
    }
  });

  const ponglineLink = this.querySelector('#pongLine') as HTMLImageElement;

    ponglineLink.addEventListener('click', () => {
    // Instead of manual pushState + PopStateEvent, 
    // just let the router handle the lifecycle.
      window.router.navigateTo("/"); 
    });

    // notification button
    const notifBtn = this.querySelector('#notif-btn');
      notifBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this.toggleNotifications();
    });
  }
}

customElements.define("app-header", Header);
