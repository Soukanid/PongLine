//import "./style.css";
import { Router } from "./core/Router";

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
