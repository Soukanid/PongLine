import { BaseComponent } from "../../core/Component";
import { chatService } from "./../chat/ChatServices";
import  pongLineImage  from "../../../public/pongline.png";
import  searchIcon  from "../../../public/search.png";
import  notifIcon  from "../../../public/notif.png";
import  chatIcon  from "../../../public/chat.png";
import { headerService } from "./HeaderService";
import { router } from "../../core/Router";

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
            <div class="relative">
              <img id="chatPage" src="${chatIcon}" class="h-8 w-8 cursor-pointer hover:scale-110 transition-transform" > 
              <span id="chat-badge" class="absolute -top-3 -right-1 text-xxl text-retro font-bold  rounded-full hidden">
                0
              </span>
            </div>
            <div class="relative" id="notif-container">
               <button id="notif-btn" class="relative hover:scale-110 transition-transform">
                  <img src="${notifIcon}" class="h-8 w-8 cursor-pointer">
                  <span id="notif-badge" class="absolute -top-3 -right-1 text-xxl text-retro font-bold rounded-full hidden">
                    0
                  </span>
               </button>

               <div id="notif-dropdown" class="absolute right-0 top-full mt-4 w-80 bg-black border border-retro z-50 hidden flex-col ">
                  <div id="notif-list" class="max-h-80 overflow-y-auto scrollbar-hide p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"> </div>
               </div>
          </div>

        </div> </div>
    `);
  }

  private  debounceTimer: any = null;
  private notifcounter : number = 0;
  private isNotifOpen : boolean = false;
  private unreadChatCounter: number = 0;

  handleNotification = (data: any) => {
      this.notifcounter++;
      this.updateNotifBadge();
  }

  handleIncomingChat = (data: any) => {
      if (!data.myId && window.location.pathname !== '/chat')
      {
          this.unreadChatCounter++;
          this.updateChatBadge();
      }
  }

  updateChatBadge()
  {
      const badge = this.querySelector('#chat-badge') as HTMLElement;
      if (!badge)
        return;

      if (this.unreadChatCounter > 0)
      {
          badge.textContent = this.unreadChatCounter > 9 ? '9+' : this.unreadChatCounter.toString();
          badge.classList.remove('hidden');
      }
      else 
          badge.classList.add('hidden');
  }

  updateNotifBadge()
  {
      const badge = this.querySelector('#notif-badge') as HTMLElement;
      if (!badge)
        return;

      if (this.notifcounter > 0)
      {
          badge.textContent = this.notifcounter > 9 ? '9+' : this.notifcounter.toString();
          badge.classList.remove('hidden');
      }
      else 
          badge.classList.add('hidden');
  }

  async connectedCallback()
  {
      super.connectedCallback?.();
      
      chatService.onNotification(this.handleNotification);
      chatService.onChatUpdate(this.handleIncomingChat);
      const list = await headerService.fetchUnreadNotifications();

      this.unreadChatCounter = await chatService.getUnreadCount();
      this.updateChatBadge();

      if (list)
      {
        const unreadList = list.filter((n: any) => n.read === false);
        this.notifcounter = unreadList.length;
      }
      this.updateNotifBadge();
  }

  disconnectedCallback() {
      super.disconnectedCallback?.();
      
      chatService.offNotification(this.handleNotification);
  }
  


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
          this.updateNotifBadge();
          headerService.markAsRead();
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
          item.className = "p-3 border-b border-retro/10 hover:bg-retro/10 transition-colors flex flex-col";
          
          let actionButton = '';

          if (n.type === 'TOURNAMENT_MATCH') {
              actionButton = `
                <button class="join-match-btn   py-1  uppercase font-bold text-retro hover:bg-retro hover:text-black transition-colors cursor-pointer mt-1">
                  [ JOIN_ROOM.exe ]
                </button>
              `;
          }

          item.innerHTML = `
             <div class="text-sm text-retro font-mono animate-pulse">"You Tournament match is ready"</div>
             ${actionButton}
             <div class="text-lg text-retro/50 text-right">${new Date(n.createdAt).toLocaleTimeString()}</div>
          `;

          if (n.type === 'TOURNAMENT_MATCH')
          {
              const btn = item.querySelector('.join-match-btn') as HTMLButtonElement;
              btn?.addEventListener('click', (e) => {
                  e.stopPropagation();
                  
                  this.isNotifOpen = false;
                  this.querySelector('#notif-dropdown')?.classList.add('hidden');
                  
                  router.navigate(`/game?mode=remote&room=${n.content}`);
              });
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
    container.innerHTML = '';

    if (results.length === 0)
    {
      container.innerHTML = `<div class="p-3 text-retro/50 text-sm font-mono">No users found</div>`;
      container.classList.remove('hidden');
      return;
    }
    
    results.forEach(u => {

      const userItem = document.createElement('div');
      userItem.className = "flex items-center p-3 text-retro font-mono hover:bg-retro hover:text-black cursor-pointer";

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
      router.navigate("/dashboard"); 
    });

    const chatLink = this.querySelector('#chatPage') as HTMLImageElement;

    chatLink.addEventListener('click', () => {
      this.unreadChatCounter = 0;
      this.updateChatBadge();
      router.navigate("/chat"); 
    });

    const notifBtn = this.querySelector('#notif-btn');
      notifBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this.toggleNotifications();
    });
  }
}

customElements.define("app-header", Header);
