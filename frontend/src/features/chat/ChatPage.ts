import { BaseComponent } from '../../core/Component';
import { chatService } from './ChatServices';
import { API_GATEWAY_URL } from '../../config' 
import contactIcon from '../../../public/contact.png'
import searchIcon from '../../../public/search.png'

interface Friend {
  id: number;
  username: string;
  avatar: string;
}

export class ChatPage extends BaseComponent {

  // private attribute 
  private friends: Friend[] = [];

  async render() {
    this.setHtml(`
    <div id="grandparent" class="h-full w-full   flex flex-col">
      <header class="h-16 flex items-center justify-between px-4">
        Pongline 
      </header>

      <div class="flex-1 flex overflow-hidden ">
      
        <div class="w-3/4 flex flex-col border border-retro/50 rounded-xl">

          <div  class="h-12 flex  border-b border-retro/50">
                Who am I
          </div>
          <div class="flex-1 flex ">
              Message Area
          </div>
          <div class="h-15 flex border-t border-retro/50">
            Input/Send Box
          </div>

        </div>
        <div class="w-1/4 flex border border-retro/50 rounded-xl flex-col ml-4">
          <div class="h-12 flex  text-white border-b border-retro/50">
            <img src="${searchIcon}" class="items-center m-2  w-8 h-8" alt="Search" />
            <input 
              id="friend-search" 
              type="text" 
              class="flex-1 bg-transparent border-none outline-none text-sm text-retro placeholder-retro" 
              placeholder="Search friends..." 
            >
          </div>
          <div id="friends-list" class=" flex-1 flex flex-col text-white">
                Who am I
          </div>
        </div>
      </div>

    `);
    this.addEvents();
    await this.loadFriend();
  
  }

  renderFriendList(listToRender: Friend[] = this.friends) {
    const div = this.querySelector('#friends-list');

    if (!div)
      return ;
    
    if (listToRender.length === 0)
    {
      div.innerHTML = `<div class="m-3 text-retro text-conter">No friends :(</div>`;
      return ;
    }

    div.innerHTML = '';

    listToRender.forEach(f => {
        
        const friendItem = document.createElement('div')
        friendItem.className = "group cursor-pointer hover:bg-retro hover:text-black- flex items-center border border-transparent hover:border-gray-600";

        friendItem.dataset.id = f.id.toString();
        friendItem.dataset.name = f.username;

        friendItem.innerHTML = `
          <img class="m-2 w-10 h-10 rounded-full avatar-img"> </div>
          <div class="m-2 flex-1">
            <div class=" font-bold group-hover:text-black font-mono text-retro username-text"></div>
          </div>
          `;
        
        // To prevent the xss attack
        const imgEl = friendItem.querySelector('.avatar-img') as HTMLImageElement;
        const nameEl = friendItem.querySelector('.username-text') as HTMLElement;

        imgEl.src = f.avatar;
        nameEl.textContent = f.username;
        
        div.appendChild(friendItem);
    });
  }

  async loadFriend() {

    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/user-management/friends`);

      if (!res.ok)
        throw new Error("Failed to load friends");
    
      this.friends = await res.json();
      this.renderFriendList();
    } catch (e) {
        console.error(e);
        //[soukaina] I should add what will show if an error happens
    }
    
  }

  addEvents() {
    const btn = this.querySelector('#send-btn');
    const input = this.querySelector('#msg-input') as HTMLInputElement;

    btn?.addEventListener('click', () => {
      if (input?.value) {
        console.log(`Sending: ${input.value}`);
        input.value = '';
      }
    });

    // search for friends
    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;

    // add the search event
    searchInput?.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
        
        const filtered = this.friends.filter(f => 
            f.username.toLowerCase().includes(query)
        );

        // Re-render with the filtered list
        this.renderFriendList(filtered);
    });
  }
}

customElements.define('page-chat', ChatPage);


