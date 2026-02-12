//import "./style.css";
import { Router } from "./core/Router";
import { chatService } from "./features/chat/ChatServices"

import "./features/auth/LoginPage";
import "./features/chat/ChatPage";
import "./features/game/Menu";
import "./features/game/Game";
import "./components/Header";
import "./features/profile/profile.ts"

declare global {
  interface Window {
    router: Router;
  }
}

const routes = {
  "/": "login-page",
  "/menu": "page-menu",
  "/game": "page-game",
  "/chat": "page-chat",
  "/demo": "page-demo",
  "/profile": "page-profile"
};

export const routerInstance = new Router(routes);
export const router = routerInstance;
window.router = routerInstance;
//const savedUserId = localStorage.getItem('userId');

const savedUserId = 1;
//[soukaina] for know we will asume that the user is already logged in
chatService.connectSocket(savedUserId);

