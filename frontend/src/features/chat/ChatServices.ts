import { Message , Friend } from "./../types"

type ChatHandler = (msg: Message) => void;
type NotificationHandler = (notif: any) => void;

class ChatService {

  private socket: WebSocket | null  = null;
  private timeToReconnect = 3000; // to reconect every 3 seconds

  private chatListeners: ChatHandler[] = [];
  private notificationListeners: NotificationHandler[] = []

  connectSocket()
  {
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
      return ;

    const url = `${import.meta.env.VITE_WSSURL}/api/chat/ws`;
    
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'NOTIFICATION')
          this.notificationListeners.forEach(cb => cb(data));
        else
          this.chatListeners.forEach(cb => cb(data));  

      } catch {
        console.error("Failed to parse the message ", event.data);
      }
    };
    
    this.socket.onclose = () => {

      //[soukaina] I should check if the session is Expired here
      //...
      
      // just if the internet drops ( the user should be still connected)
      if (this.socket)
      {
        this.socket.close();
        this.socket = null;
      }
      // [soukaina] to be updated
      // setTimeout(() => {
      //   if (this.myUserId) {
      //     this.connectSocket(this.myUserId);
      //   }
      // }, this.timeToReconnect);
    };

  }

  onChatUpdate(callback: ChatHandler) {
    this.chatListeners.push(callback);
  }

  offChatUpdate(callback: ChatHandler) {
    this.chatListeners = this.chatListeners.filter(cb => cb !== callback);
  }

  onNotification(callback: NotificationHandler) {
    this.notificationListeners.push(callback);
  }

  offNotification(callback: NotificationHandler) {
    this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
  }
  
  disconnectSocket() {
    if (this.socket)
    {
      this.socket.close();
      this.socket = null;
    }

  }

  async sendMessage(friendId: number, text: string)
  {
    if (this.socket && this.socket.readyState == WebSocket.OPEN)
    {
      const data= {
        receiver_id: friendId,
        content: text
      };

      this.socket.send(JSON.stringify(data));
    }
    else
      console.error("Socket no connected");
  }

  async getMessageHistory(friendId: number, ): Promise<Message[]> {

    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/messages`);

    url.searchParams.append('friendId', friendId.toString());
  
    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'content-Type': 'application/json',
      }
    });
  
    if (!response.ok)
    {
      console.error("Failed to load Chat History");
    }
    return await response.json();
  }

  async getFriends(): Promise<Friend[]> {

    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/friends`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'content-Type': 'application/json',
      }
    });
  
    if (!response.ok)
    {
      console.error("Failed to load Friends");
    }
    return await response.json();
  }

  async getBlockedUsers(): Promise<Friend[]> {

    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/blocked_users`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'content-Type': 'application/json',
      }
    });
  
    if (!response.ok)
    {
      console.error("Failed to load Blocked Users");
    }
    return await response.json();
  }

  // to be checked ************
  async getInvitations(): Promise<Friend[]> {

    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/invitations`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'content-Type': 'application/json',
      }
    });
  
    if (!response.ok)
    {
      console.error("Failed to load Blocked Users");
    }
    return await response.json();
  }
}


export const chatService = new ChatService();
