import "./style.css";
import { Router } from "./core/Router";

import "./features/auth/LoginPage";
import "./features/chat/ChatPage";
import "./features/demo/showdata";

const routes = {
  "/": "page-login",
  "/game": "page-game",
  "/chat": "page-chat",
  "/demo": "page-demo"
};

new Router(routes);
