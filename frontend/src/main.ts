//import "./style.css";
import { router } from "./core/Router";
import { AuthService } from "./features/auth/authService.ts"
import { chatService } from "./features/chat/ChatServices.ts"
/*
import "./features/auth/LoginPage";
import "./features/chat/ChatPage";
import "./features/game/Menu";
import "./features/game/Game";
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

chatService.connectSocket();

//initialize app
*/
class App {
  private currentPage: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    //Check authentication
    await AuthService.init();

    //setup router
    window.addEventListener("popstate", () => this.render());

    document.body.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.matches("[data-link]")) {
        e.preventDefault();
        router.navigate((target as HTMLAnchorElement).href);
      }
      if (target.matches("button[data-url]")) {
        e.preventDefault();
        router.navigate(target.dataset.url!);
      }
    });

    chatService.connectSocket();

    //initial render
    this.render();
  }

  private async render() {
    const path = new URL(window.location.href);
    const page = await router.resolve(path);

    if (this.currentPage) {
      this.currentPage.remove();
    }

    this.currentPage = page;
    document.getElementById("app")?.appendChild(page);
  }
}

//Start app
new App()
