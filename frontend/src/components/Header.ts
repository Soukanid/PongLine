import { BaseComponent } from "../core/Component";
import  pongLineImage  from "../../public/pongline.png";
import  searchIcon  from "../../public/search.png";
import  notifIcon  from "../../public/notif.png";
import  chatIcon  from "../../public/chat.png";

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
      }
    });

    // to close the search dropdown when u click outside
    document.addEventListener('click', (e) => {
    // we avoid clicks inside the parent dev "header"
    if (!this.contains(e.target as Node))
        resultsContainer.classList.add('hidden');

    });
const ponglineLink = this.querySelector('#pongLine') as HTMLImageElement;

ponglineLink.addEventListener('click', () => {
    // Instead of manual pushState + PopStateEvent, 
    // just let the router handle the lifecycle.
    window.router.navigateTo("/"); 
});
  }
}

customElements.define("app-header", Header);
