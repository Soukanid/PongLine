//port { StringMappingType } from "typescript";
import { AuthService } from "../features/auth/authService";
import  "../features/auth/LoginPage";
import  "../features/game/Game";
import "../features/chat/ChatPage";
import "../features/game/Render";
import "../features/utils/LandingPage";
import "../features/utils/NotFoundPage";
import "../features/profile/profile"
import "./Component";
import "../features/game/Menu";
/*
export class Router {
  routes: Record<string, string>;

  constructor(routes: Record<string, string>) {
    this.routes = routes;

    // handle the 'Back' button
    window.addEventListener('popstate', () => this.loadRoute());
    document.body.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-link]')) {
        e.preventDefault();
        this.navigateTo((target as HTMLAnchorElement).href);
      }
      if (target.matches('button[data-url]')) {
        e.preventDefault();
        this.navigateTo(target.dataset.url!);
      }
    });
    this.loadRoute();
  }

  navigateTo(url: string) {
    history.pushState(null, '', url);
    this.loadRoute();
  }

  loadRoute() {
    const path = window.location.pathname;
    const tagName = this.routes[path] || this.routes['/'];
    const app = document.getElementById('app');
    if (app) app.innerHTML = `<${tagName}></${tagName}>`;
  }
}
*/
interface Route {
  path: string
  page:  string
  protected?: boolean
}

const routes: Route[] = [
  {path: '/', page: "landing-page"},
  {path: '/login', page: "login-page"},
  {path: '/dashboard', page: "profile-page"},
  {path: '/menu', page: "menu-page"},
  {path: '/game', page: "game-page"},
  {path: '/chat', page: "chat-page"},
//  {path: '/tournaments', page: TournamentPage}
]

export const router = {
  async resolve(url:URL): Promise<HTMLElement>{
    //check if route exists
    const route = routes.find(r => this.matchPath(r.path, url.pathname))

    if (!route){
      console.log("route not found")
      return document.createElement("not-found-page")
    }

    //check authentication for protected routes
    if (route.path !== '/login' && route.path !== '/' && !AuthService.isAuthenticated()){
      console.log("not authenticated")
      history.pushState({},"", `/login?redirect=${encodeURIComponent(url.pathname)}`)
      return document.createElement("login-page")
    }

    //check authorization for users routes
    //redirect to dashboard if already logged in
    if (route.path === '/login' && AuthService.isAuthenticated()){
      console.log("login but authenticated")
      history.pushState({},"", '/dashboard')
      return document.createElement("profile-page")
    }
    return document.createElement(route.page)
  },

  matchPath(routePath: string, currentPath: string): boolean{
    //simple path matching
    if (routePath.includes(':')){
      const routeParts = routePath.split('/')
      const pathParts = currentPath.split('/')

      if (routeParts.length !== pathParts.length) return false

      return routeParts.every((part, i)=>
      part.startsWith(':') || part === pathParts[i])
    }
    return routePath === currentPath
  },

  navigate(path: string){
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}