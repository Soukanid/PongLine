import "./style.css"; // If you have CSS
import { Router } from "./core/Router";

// Import your pages
import "./features/auth/LoginPage";

const routes = {
  "/": "page-login",
  "/game": "page-game",
  "/chat": "page-chat",
};

new Router(routes);
