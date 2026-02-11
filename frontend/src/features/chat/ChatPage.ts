import { BaseComponent } from '../../core/Component';
import { chatService , Message} from './ChatServices';
import contactIcon from '../../../public/contact.png'
import gameIcon from '../../../public/game.png'
import searchIcon from '../../../public/search.png'
import sendIcon from '../../../public/sent.png'
import blockIcon from '../../../public/block.png'
import inviteIcon from '../../../public/invite.png'
import personIcon from '../../../public/person.png'


interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export class ChatPage extends BaseComponent {

  // private attribute 
  private friends: Friend[] = [];
  private currentList: Friend[] = [];
  private activeFriendId : number | null = null;
  private activeFriendUsername : string | null = null;
  private myUserId: number = 0;


  async render() {

    this.myUserId = 1; //[soukaina] hard coded for now

    this.setHtml(`
    <div id="grandparent" class="h-full w-full   flex flex-col">
      <div class="flex-1 flex overflow-hidden ">
      
        <div class="w-3/4 flex flex-col border border-retro/50 rounded-xl">

          <div id="chat-header" class="items-center h-12 flex  border-b border-retro/50"></div>
          <div id="message-area" class="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"></div>
          <div class="msg-input h-15 flex border-t border-retro/50 ">
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
          <div class="h-12 flex  text-white border-b border-retro/50 shrink-0">
            <img src="${searchIcon}" class="items-center m-2  w-8 h-8" alt="Search" />
            <input 
              id="friend-search" 
              type="text" 
              autocomplete=off
              class="flex-1 focus:outline-none bg-transparent font-mono text text-retro" 
              placeholder="Search friends..." 
            >
          </div>
          <div id="friends-list" class="min-h-0 flex-1 flex flex-col text-white  overflow-y-auto scrollbar-hide p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          </div>
          <div class="border-t border-retro/50 flex justify-between items-center px-4 py-2">
            <button id="friends-contact" class="cursor-pointer px-4 py-2 on hover:">
              <img src="${contactIcon}" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>

            <button id="blocked_user" class="cursor-pointer px-4 py-2">
              <img src="${blockIcon}" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>

            <button id="friend-chat" class="cursor-pointer px-4 py-2">
              <img src="${inviteIcon}" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

    `);
    this.addEvents();
    await this.loadFriend();
  
  }

  renderFriendList(listToRender: Friend[] = this.currentList) {
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
          <a href="/profile?id=${f.username}" data-link class="avatar-link z-10 relative">
             <img class="m-2 w-10 h-10 rounded-full avatar-img hover:scale-110 "> 
          </a>
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

        if (!f.avatar)
          imgEl.src = personIcon;
        else
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
      const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/chat_friends`);
      
      url.searchParams.append('myId', this.myUserId.toString());

      const res = await fetch(`${url}`.toString(),
                                { method: 'GET',
                                  headers: {
                                    'content-Type': 'application/json'
                                  }
                                });

      if (!res.ok)
        throw new Error("Failed to load friends");
    
      this.friends = await res.json();
      this.currentList = this.friends;
      this.renderFriendList(this.friends);
    } catch (e) {
        console.error(e);
    }
    
  }

  addMessageToUI(msg: Message) {
    const area = this.querySelector('#message-area');
    if (!area) return;

    let senderName = 'Unknown';

    if (msg.sender_id === this.myUserId) {
        senderName = 'You';
    } else if (msg.sender_id === this.activeFriendId) {
        senderName = this.activeFriendUsername || 'Friend';
    } else {
        senderName = 'Someone else'; 
    }

    const date = msg.created_at ? new Date(msg.created_at) : new Date();
    const timeStr = date.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    const line = document.createElement('div');
    line.className = "w-full mb-1 font-mono text-sm text-retro break-words hover:bg-retro/10 transition-colors px-2";

    line.innerHTML = `
      <span class="opacity-60 mr-2">[${timeStr}]</span>
      <span class="font-bold mr-2">&lt;${senderName}&gt;</span>
      <span class="text-retro">${msg.content}</span>
    `;

    area.appendChild(line);
    
    area.scrollTop = area.scrollHeight; 
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

      const icon = document.createElement('img');
      icon.className = "items-center m-2  w-8 h-8 ml-auto";
      icon.src = gameIcon;

      chatHeader.appendChild(span);
      chatHeader.appendChild(nameSpane);
      chatHeader.appendChild(icon);

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

  async showContact()
  {
    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;
      if (searchInput)
        searchInput.value = '';
    this.friends = await chatService.getFriends();
    this.currentList = this.friends;
    this.renderFriendList(this.currentList);
  }
    
  async showBlocked()
  {
    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;
      if (searchInput)
        searchInput.value = '';

    this.friends = await chatService.getBlockedUsers();

    this.currentList = this.friends;
    this.renderFriendList(this.currentList);
  }

  addEvents() {
    const btn = this.querySelector('#send-btn');
    const input = this.querySelector('#msg-input') as HTMLInputElement;

    chatService.onMessageReceived((msg: Message) => {
        //[soukaina] this is hardcoded for now
        if (msg.sender_id === this.activeFriendId )
        {
            this.addMessageToUI(msg);
        }
        else if (msg.sender_id === this.myUserId) {
           if (msg.receiver_id === this.activeFriendId) {
              this.addMessageToUI(msg);
           }
        }
    }); 

    const sendMessage = () =>
    {
      const msg = input.value.trim();

      // if the message is empty we don't do anything
      if (!msg || !this.activeFriendId)
        return ;

      chatService.sendMessage(this.activeFriendId, msg); 

      input.value = '';
    }

    btn?.addEventListener('click', sendMessage);

    const contactBtn = this.querySelector('#friends-contact');
    contactBtn?.addEventListener('click', () => this.showContact());

    const blockListBtn = this.querySelector('#blocked_user');
    blockListBtn?.addEventListener('click', () => this.showBlocked());

    const chatListBtn = this.querySelector('#friend-chat');
    chatListBtn?.addEventListener('click', () => this.loadFriend());

    btn?.addEventListener('click', sendMessage);

    if (input)
    { 
      input.addEventListener('keydown', (e) => 
      {
        if (e.key === 'Enter')
          sendMessage();    
      });
    }

    // search for friends
    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;

    // add the search event
    searchInput?.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase().trim();
        
        const filtered = this.currentList.filter(f => 
            f.username.toLowerCase().includes(query)
        );

        // Re-render with the filtered list
        this.renderFriendList(filtered);
    });
  }
}

customElements.define('page-chat', ChatPage);


