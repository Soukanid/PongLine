import { router } from "./core/Router";
import { AuthService } from "./features/auth/authService.ts"
import { chatService } from "./features/chat/ChatServices.ts";

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
   /* const header = document.querySelector('app-header');
    if (header){
      (header as any).update();
    }
*/
    if (this.currentPage) {
      this.currentPage.remove();
    }

    this.currentPage = page;
    document.getElementById("app")?.appendChild(page);
  }
}

//Start app
new App()
