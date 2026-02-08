import { BaseComponent } from '../../core/Component';
import { chatService , Message} from './ChatServices';
import { API_GATEWAY_URL } from '../../config' 
import contactIcon from '../../../public/contact.png'
import searchIcon from '../../../public/search.png'
import sendIcon from '../../../public/sent.png'

interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export class ChatPage extends BaseComponent {

  // private attribute 
  private friends: Friend[] = [];
  private activeFriendId : number | null = null;
  private activeFriendUsername : string | null = null;

  async render() {
    this.setHtml(`
    <div id="grandparent" class="h-full w-full   flex flex-col">
      <header class="h-16 flex items-center justify-between px-4">
        Pongline 
      </header>

      <div class="flex-1 flex overflow-hidden ">
      
        <div class="w-3/4 flex flex-col border border-retro/50 rounded-xl">

          <div id="chat-header" class="h-12 flex  border-b border-retro/50"></div>
          <div id="message-area" class="flex-1 flex "></div>
          <div class="msg-input h-15 flex border-t border-retro/50">
          <input id="msg-input" 
           type="text" 
           autocomplete="off"
           disabled
           class="flex-1 ml-5 focus:outline-none border-none bg-transparent  text-retro placeholder-retro/50 font-mono h-full" 
           placeholder="> Type Message Here..." 
          >

          <button id="send-btn" 
            class="cursor-pointer ml-4 px-4 py-2">
            <img src="${sendIcon}"
              class="w-8 h-8  group-hover:brightness-0" disabled/>
          </button>
          </div>

        </div>
        <div class="w-1/4 flex border border-retro/50 rounded-xl flex-col ml-4">
          <div class="h-12 flex  text-white border-b border-retro/50">
            <img src="${searchIcon}" class="items-center m-2  w-8 h-8" alt="Search" />
            <input 
              id="friend-search" 
              type="text" 
              autocomplete=off
              class="flex-1 focus:outline-none bg-transparent text text-retro" 
              placeholder="Search friends..." 
            >
          </div>
          <div id="friends-list" class=" flex-1 flex flex-col text-white">
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
      div.innerHTML = `<div class="m-3 text-retro text-center">No friends :(</div>`;
      return ;
    }

    div.innerHTML = '';

    listToRender.forEach(f => {
        
        const friendItem = document.createElement('div')
        friendItem.className = "friend-item group text-retro cursor-pointer hover:bg-retro hover:text-black flex items-center ";

        friendItem.dataset.id = f.id.toString();
        friendItem.dataset.name = f.username;

        // Show the status of the friend
        var statusHTML: string = '';
        if (f.isOnline)
          statusHTML = `<span class="mr-3 text-[20px] font-mono text-retro animate-pulse"> ONLINE </span>`;
        

        friendItem.innerHTML = `
          <img class="m-2 w-10 h-10 rounded-full avatar-img"> </div>
          <div class="m-2 flex-1">
            <div class=" font-bold  font-mono username-text"></div>
          </div>
          <div class="ml-auto mr-3 text-[20px] font-mono text-retro animate-pulse">
            ${statusHTML}
          </div>
          `;
        
        // To prevent the xss attack
        const imgEl = friendItem.querySelector('.avatar-img') as HTMLImageElement;
        const nameEl = friendItem.querySelector('.username-text') as HTMLElement;

        imgEl.src = f.avatar;
        nameEl.textContent = f.username;
        
        friendItem.addEventListener('click', () => {
          this.querySelectorAll('.friend-item').forEach(el => {
            el.classList.remove('bg-retro' ,'text-black');
            el.classList.add('text-retro');
          })

          friendItem.classList.remove('text-retro');
          friendItem.classList.add('bg-retro', 'text-black');
          this.openChat(f.id, f.username);
        });
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

  addMessageToUI(msg: Message) {
    const area = this.querySelector('#message-area');
    if (!area) return;

    const isFriend = msg.sender_id === this.activeFriendId;

    // 1. Create Wrapper
    const bubble = document.createElement('div');
    bubble.className = `flex w-full mb-2 ${isFriend ? 'justify-start' : 'justify-end'}`;
    
    // 2. Create Box
    const box = document.createElement('div');
    box.className = `max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-md ${
        isFriend 
          ? 'bg-gray-700 text-gray-100 rounded-tl-none' 
          : 'bg-blue-600 text-white rounded-tr-none'
    }`;

    const textDiv = document.createElement('div');
    textDiv.className = "break-words";
    textDiv.textContent = msg.content; // The content is treated as pure text
    
    const timeDiv = document.createElement('div');
    timeDiv.className = "text-[10px] opacity-50 mt-1 text-right";
    const date = msg.sent_at ? new Date(msg.sent_at) : new Date();
    timeDiv.textContent = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    box.appendChild(textDiv);
    box.appendChild(timeDiv);
    bubble.appendChild(box);

    area.appendChild(bubble);
    // this.scrollToBottom();
  }

  
  async openChat(friendId: number, name:string) {
    
    this.activeFriendId = friendId;

    const chatHeader = this.querySelector('#chat-header');
    
    if (chatHeader)
    {
      chatHeader.innerHTML = '';
      const span = document.createElement('span');
      span.className = "p-3 items-center text-retro font-mono"
      span.textContent = "Chatting with : "

      const nameSpane = document.createElement('span');
      nameSpane.className = "p-3 items-center text-retro font-bold font-mono"
      nameSpane.textContent = name;
      chatHeader.appendChild(span);
      chatHeader.appendChild(nameSpane);
    }

    // enable the button and the input field
    const input = this.querySelector('#msg-input') as HTMLInputElement;
    const btn = this.querySelector('#send-btn') as HTMLButtonElement;
    
    input.disabled = false;
    btn.disabled = false;
    input.focus();

    const messageArea = this.querySelector("#message-area");
    if (messageArea)
      messageArea.innerHTML = `<div class="text-retro text-center ml-10 animate-pulse">Loading conversation...</div>`;
  
    const messages = await chatService.getMessageHistory(friendId);

    if (messageArea)
      messageArea.innerHTML = '';

    messages.forEach(m => this.addMessageToUI(m));

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


