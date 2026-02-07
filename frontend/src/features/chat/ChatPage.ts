import { BaseComponent } from '../../core/Component';
import { chatService } from './ChatServices';
import { API_GATEWAY_URL } from '../../config' 

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
                fs
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

  renderFriendList() {
    const div = this.querySelector('#friends-list');

    if (!div)
      return ;
    
    if (this.friends.length === 0)
    {
      div.innerHTML = `<div class="text-gray-500 text-conter">No friends :(, The Poor you </div>`;
      return ;
    }

    div.innerHTML = '';

    this.friends.forEach(f => {
        
        // // Create elements securely
        // const item = document.createElement('div');
        // item.className = "friend-item p-3 rounded-lg cursor-pointer hover:bg-gray-700/50 flex items-center gap-3 transition-all border border-transparent hover:border-gray-600";
        // item.dataset.id = f.id.toString();
        // item.dataset.name = f.username;
        //
        // item.innerHTML = `
        //    <div class="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border border-gray-500">
        //       <img src="${f.avatar}" class="w-full h-full object-cover" alt="avatar">
        //    </div>
        //    <div class="flex-1">
        //       <div class="font-bold text-sm text-gray-200 username-text"></div> 
        //       <div class="text-[10px] text-green-400 font-bold tracking-wide">ONLINE</div>
        //    </div>
        // `;
        //
        // // ✅ SECURITY: Set username via textContent
        // const nameEl = item.querySelector('.username-text');
        // if (nameEl) nameEl.textContent = f.username;
        //
        // // Add Click Event
        // item.addEventListener('click', () => {
        //     this.querySelectorAll('.friend-item').forEach(el => el.classList.remove('bg-blue-600/20', 'border-blue-500/30'));
        //     item.classList.add('bg-blue-600/20', 'border-blue-500/30');
        //     this.querySelectorAll(f.username);
        // });
        //
        // div.appendChild(item);

        const friendItem = document.createElement('div')
        friendItem.className = "cursor-pointer hover:bg-gray-700 flex items-center border border-transparent hover:border-gray-600";

        friendItem.dataset.id = f.id.toString();
        friendItem.dataset.name = f.username;

        friendItem.innerHTML = `
          <img class="m-2 w-10 h-10 rounded-full avatar-img"> </div>
          <div class="m-2 flex-1">
            <div class="it font-mono text-retro username-text"></div>
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
  }
}

customElements.define('page-chat', ChatPage);


