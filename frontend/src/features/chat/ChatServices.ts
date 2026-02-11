
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
}

class ChatService {

  private socket: WebSocket | null  = null;
  private timeToReconnect = 3000; // to reconect every 3 seconds
  private myUserId : number = 0; // should be updated

  private messageHandler: ((msg: Message) => void) | null = null;

  connectSocket(userId: number)
  {
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
      return ;

    this.myUserId = userId;
    const url = `${import.meta.env.VITE_WSSURL}/api/chat/ws?userId=${userId}`;
    
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const mesg: Message = JSON.parse(event.data);

        // the moment the message been arrived ,show it on the UI
        if (this.messageHandler) {
            this.messageHandler(mesg);
        }
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
      setTimeout(() => {
        if (this.myUserId) {
          this.connectSocket(this.myUserId);
        }
      }, this.timeToReconnect);
    };

  }

  onMessageReceived(callback: (msg: Message) => void) {
      this.messageHandler = callback;
  }
  
  disconnectSocket() {
    this.myUserId = 0;
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
        sender_id: this.myUserId,
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

    url.searchParams.append('user1', this.myUserId.toString());
    url.searchParams.append('user2', friendId.toString());
  
    const response = await fetch(url.toString(), {
      method: 'GET',
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
}


export const chatService = new ChatService();
