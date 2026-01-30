import "./style.css";
import { Router } from "./core/Router";

import "./features/auth/LoginPage";
import "./features/demo/showdata";
import "./features/game/Menu";
import "./features/game/Game";

const routes = {
  "/": "page-login",
  "/menu": "page-menu",
  "/game": "page-game",
  "/chat": "page-chat",
  "/demo": "page-demo"
};

export const router = new Router(routes);
