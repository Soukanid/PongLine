export interface User {
  id: string;
  email: string;
  username: string;
  alias?: string;
  avatar?: string;
}

export interface Message {
  id: number;
  myId: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

export interface Friend {
  id: number;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export interface Tournament {
  id: number;
  tour_name: string;
  tour_id: string;
}

