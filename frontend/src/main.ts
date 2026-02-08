//import "./style.css";
import { Router } from "./core/Router";
import { chatService } from "./features/chat/ChatServices"

import "./features/auth/LoginPage";
import "./features/chat/ChatPage";
import "./features/demo/showdata";
import "./features/game/Menu";
import "./features/game/Game";

const routes = {
  "/": "login-page",
  "/menu": "page-menu",
  "/game": "page-game",
  "/chat": "page-chat",
  "/demo": "page-demo",
};

export const router = new Router(routes);

//const savedUserId = localStorage.getItem('userId');

const savedUserId = 1;
//[soukaina] for know we will asume that the user is already logged in

if (savedUserId) {

  chatService.connectSocket(savedUserId);
}

// if he is not we should redirect him to the login page
