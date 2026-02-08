import { API_GATEWAY_URL } from '../../config'

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
}

class ChatService {

  private socket: WebSocket | null  = null;
  private timeToReconnect = 3000; // to reconect every 3 seconds
  private myUserId : number = 0;

  connectSocket(userId: number)
  {
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
    {
      return ;
    }
    this.myUserId = userId;
    const url = `${API_GATEWAY_URL}/api/chat/ws?userId=${userId}`;
    this.socket = new WebSocket(url);


    this.socket.onmessage = (event) => {
      try {
        const mesg: Message = JSON.parse(event.data);
        //[soukaina] to remove (for debugging)
        console.log(" the new message : ", mesg);
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
    const url = new URL(`${API_GATEWAY_URL}/api/chat/create_message`);
    
    const data= {
      sender_id: this.myUserId,
      receiver_id: friendId,
      content: text
    };

    const response = await fetch(url.toString(), {
      method: 'Post',
      headers: {
        'content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok)
      console.error("Failed to send message");
  }

  async getMessageHistory(friendId: number, ): Promise<Message[]> {

    const url = new URL(`${API_GATEWAY_URL}/api/chat/messages`);

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
}

export const chatService = new ChatService();
