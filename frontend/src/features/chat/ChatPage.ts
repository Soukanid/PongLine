import { BaseComponent } from '../../core/Component';
import { chatService} from './ChatServices';
import { Message, Friend } from '../../core/Types'
import { router } from "../../core/Router";


export class ChatPage extends BaseComponent {

  // private attribute 
  private friends: Friend[] = [];
  private currentList: Friend[] = [];
  private activeFriendId : number | null = null;
  private activeFriendUsername : string | null = null;
  private isBlockedView: boolean = false;
  private isInvitationView: boolean = false;
  private isOnlineView: boolean = true;


  async render() {

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
            <img src="/sent.png"
              class="w-8 h-8  group-hover:brightness-0" disabled/>
          </button>
          </div>

        </div>
        <div class="w-1/4 flex border border-retro/50 rounded-xl flex-col ml-4">
          <div class="h-12 flex items-center text-white border-b border-retro/50 shrink-0">
              <img src="/search.png" class="m-2 w-8 h-8 shrink-0" alt="Search" />

              <input 
                  id="friend-search" 
                  type="text" 
                  autocomplete="off"
                  /* Added min-w-0 here */
                  class="flex-1 min-w-0 focus:outline-none bg-transparent font-mono text text-retro" 
                  placeholder="Search friends..." 
              >
              <button id="invitations" class="cursor-pointer px-4 py-2 shrink-0">
                  <img src="/invite.png" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
              </button>
          </div>
          <div id="friends-list" class="min-h-0 flex-1 flex flex-col text-white  overflow-y-auto scrollbar-hide p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          </div>
          <div class="border-t border-retro/50 flex justify-between items-center px-4 py-2">
            <button id="friends-contact" class="cursor-pointer px-4 py-2">
              <img src="/contact.png" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>

            <button id="blocked_user" class="cursor-pointer px-4 py-2">
              <img src="/block.png" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>

            <button id="friend-chat" class="cursor-pointer px-4 py-2">
              <img src="chat.png" class="w-8 h-8 group-hover:brightness-0 hover:opacity-80 transition-opacity" />
            </button>
          </div>
        </div>
      </div>

    `);
    await this.loadFriend();
    await this.checkUrlForTargetUser();
  }


  private handleIncomingMessage = (msg: Message) => {
    const isFromContact = msg.sender_id === this.activeFriendId;
    const isMyMessage = msg.sender_id === msg.myId && msg.receiver_id === this.activeFriendId;

    if (isFromContact || isMyMessage) {
        this.addMessageToUI(msg);
    }
  }

  connectedCallback()
  {   
      super.connectedCallback();
      chatService.onChatUpdate(this.handleIncomingMessage);
  }

  disconnectedCallback()
  {
      chatService.offChatUpdate(this.handleIncomingMessage);
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
        if (this.isOnlineView && f.isOnline)
          statusHTML = `<span class="mr-3 text-[20px] font-mono text-retro animate-pulse hover:text-black"> ONLINE </span>`;
        
        friendItem.innerHTML = `
          <img class="m-2 w-10 h-10 rounded-full avatar-img transition-transform hover:scale-110 group-hover:brightness-0">
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
          imgEl.src = '/person.png';
        else
          imgEl.src = f.avatar;

        imgEl.addEventListener('click', () => {
            router.navigate(`/profile?username=${f.username}`); 
        });

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
    this.isBlockedView = false
    this.isInvitationView = false;
    this.isOnlineView = false;

    try {
      const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/chat_friends`);
      
      const res = await fetch(`${url}`.toString(),
                                { method: 'GET',
                                  headers: {
                                    'Authorization': "include",
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
    if (!area)
      return;

    let senderName = 'Unknown';

    if (msg.sender_id === msg.myId)
        senderName = 'You';
    else if (msg.sender_id === this.activeFriendId)
        senderName = this.activeFriendUsername || 'Friend';
    else
        senderName = 'Someone else'; 

    const date = msg.created_at ? new Date(msg.created_at) : new Date();
    const timeStr = date.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const formattedContent = msg.content.replace(urlRegex, (url) => {
        return `<a href="${url}" class=" text-retro px-2 py-1 ml-2 font-bold hover:bg-retro hover:text-black transition-colors cursor-pointer">[ JOIN ]</a>`;
    });

    const line = document.createElement('div');
    line.className = "w-full mb-1 font-mono text-sm text-retro break-words hover:bg-retro/10 transition-colors px-2";

    line.innerHTML = `
      <span class="opacity-60 mr-2">[${timeStr}]</span>
      <span class="font-bold mr-2">&lt;${senderName}&gt;</span>
      <span class="text-retro">${formattedContent}</span>
    `;

    area.appendChild(line);
    
    area.scrollTop = area.scrollHeight; 
  }

  
  async openChat(friendId: number, name:string) {
    
    this.activeFriendId = friendId;
    this.activeFriendUsername = name;

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
      icon.className = "items-center m-2  w-8 h-8 ml-auto group-hover:brightness-0 hover:opacity-80 transition-opacity cursor-pointer";
      icon.src = '/game.png';

      icon.addEventListener('click', async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/create-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          
          const res = await response.json();
          
          if (res.success && res.roomId)
          { 
            const gameLink = `${window.location.origin}/game?mode=remote&room=${res.roomId}`;
            
            if (this.activeFriendId)
            {
                const inviteText = `I challenge you to a match! Join here: ${gameLink}`;
                await chatService.sendMessage(this.activeFriendId, inviteText);
            }
          }
          } catch (err) {
            console.error(err);
          }
      });

      chatHeader.appendChild(span);
      chatHeader.appendChild(nameSpane);
      chatHeader.appendChild(icon);

    }

    // mark the messages of this friend as read and update the read counter
    await chatService.markAsRead(friendId);

    // enable the button and the input field
    const input = this.querySelector('#msg-input') as HTMLInputElement;
    const btn = this.querySelector('#send-btn') as HTMLButtonElement;
    const messageArea = this.querySelector("#message-area");

    if (this.isInvitationView)
    {
        input.disabled = true;
        btn.disabled = true;
        input.value = ""; 
        input.placeholder = "> Pending Friend Request...";
        input.classList.add("cursor-not-allowed", "opacity-50");
        
        if (messageArea) {
            messageArea.innerHTML = `
              <div class="flex flex-col items-center justify-center h-full text-retro font-mono">
                <button id="go-to-profile" class="cursor-pointer border border-retro px-6 py-3 hover:bg-retro hover:text-black transition-colors font-bold tracking-widest">
                  [ VIEW PROFILE TO ACCEPT.sh ]
                </button>
              </div>
            `;
            const profileBtn = messageArea.querySelector('#go-to-profile');
            profileBtn?.addEventListener('click', () => router.navigate(`/profile?username=${name}`));
        }
        return;
    }
    if (this.isBlockedView)
    {
        input.disabled = true;
        btn.disabled = true;
        input.value = ""; 
        input.placeholder = "You have blocked this user";
        input.classList.add("cursor-not-allowed", "opacity-50");
    } 
    else
    {
        input.disabled = false;
        btn.disabled = false;
        input.placeholder = "> Type Message Here...";
        input.classList.remove("cursor-not-allowed", "opacity-50");
        input.focus();
    }

    if (messageArea)
      messageArea.innerHTML = `<div class="text-retro text-center ml-10 animate-pulse">Loading conversation...</div>`;
  
    const messages = await chatService.getMessageHistory(friendId);

    if (messageArea)
      messageArea.innerHTML = '';

    messages.forEach(m => this.addMessageToUI(m));

  }

  async showContact()
  {
    this.isBlockedView = false;
    this.isInvitationView = false;
    this.isOnlineView = true;

    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;
      if (searchInput)
        searchInput.value = '';
    this.friends = await chatService.getFriends();
    this.currentList = this.friends;
    this.renderFriendList(this.currentList);
  }
    
  async showBlocked()
  {
    this.isBlockedView = true;
    this.isInvitationView = false;
    this.isOnlineView = false;

    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;
      if (searchInput)
        searchInput.value = '';

    this.friends = await chatService.getBlockedUsers();

    this.currentList = this.friends;
    this.renderFriendList(this.currentList);
  }

  async showInvitations()
  {
    this.isBlockedView = false;
    this.isInvitationView = true;
    this.isOnlineView = false;

    const searchInput = this.querySelector('#friend-search') as HTMLInputElement;
      if (searchInput)
        searchInput.value = '';

    this.friends = await chatService.getInvitations();
    this.currentList = this.friends
    this.renderFriendList(this.currentList);
  }

  addEvents() {
    const btn = this.querySelector('#send-btn');
    const input = this.querySelector('#msg-input') as HTMLInputElement;

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

    const invitationListBnt = this.querySelector('#invitations');
    invitationListBnt?.addEventListener('click', () => this.showInvitations());

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

  async checkUrlForTargetUser()
  {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUsername = urlParams.get('user');

    if (!targetUsername) 
      return;

    const globalUsers = await chatService.searchGlobalUsers(targetUsername);
    const targetUser = globalUsers.find(u => u.username === targetUsername);

    if (targetUser)
      this.openChat(targetUser.id, targetUser.username);
  }
}

customElements.define('chat-page', ChatPage);


