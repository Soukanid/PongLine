
export interface Message {
  id: number;
  myId: number;
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

  private messageHandler: ((msg: Message) => void) | null = null;

  connectSocket()
  {
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
      return ;

    const url = `${import.meta.env.VITE_WSSURL}/api/chat/ws`;
    
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
      // [soukaina] to be updated
      // setTimeout(() => {
      //   if (this.myUserId) {
      //     this.connectSocket(this.myUserId);
      //   }
      // }, this.timeToReconnect);
    };

  }

  onMessageReceived(callback: (msg: Message) => void) {
      this.messageHandler = callback;
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
      headers: {
        'Authorization': "include",
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
        'Authorization': "include",
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
        'Authorization': "include",
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
