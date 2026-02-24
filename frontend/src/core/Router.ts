import { AuthService } from "../features/auth/authService";
import  "../features/auth/LoginPage";
import  "../features/game/Game";
import "../features/chat/ChatPage";
import "../features/game/Render";
import "../features/setting/SettingPage";
import "../features/utils/LandingPage";
import "../features/utils/NotFoundPage";
import "../features/utils/NotAllowedPage";
import "../features/profile/ProfilePage"
import "./Component";
import "../features/game/Menu";
import "../features/Header/Header";
import { appStore } from "./Store";

interface Route {
  path: string
  page:  string
  protected?: boolean
}

const routes: Route[] = [
  {path: '/', page: "landing-page", protected:false},
  {path: '/login', page: "login-page", protected:false},
  {path: '/dashboard', page: "profile-page", protected:false},
  {path: '/profile', page: "profile-page", protected:false},
  {path: '/settings', page: "settings-page", protected:false},
  {path: '/menu', page: "menu-page", protected:false},
  {path: '/game', page: "game-page", protected:false},
  {path: '/chat', page: "chat-page", protected:true},
  {path: '/WarriorsOnly', page: "not-allowed-page", protected:false},
  {path: '/LostYourWay', page: "not-found-page", protected:false},
]

export const router = {
  async resolve(url:URL): Promise<HTMLElement>{

    //check if route exists
    const route = routes.find(r => this.matchPath(r.path, url.pathname))

    //landing page
    if (route && route.path === '/')
    {
      history.pushState({},"",route.path);
      return document.createElement("landing-page");
    }

    //check authentication
    if (!AuthService.isAuthenticated()){

      console.log("not authenticated");
      if (route && route.path !== "/login" && route.path !== "/") {
        history.pushState(
          {},
          "",
          `/login?redirect=${encodeURIComponent(url.pathname)}`,
        );
      }
      return document.createElement("login-page");
    }

    //redirect if route doesnt exist
    if (!route){
      console.log("route not found")
      history.pushState({},"", '/LostYourWay')
      return document.createElement("not-found-page")
    }

    console.log(appStore.getUser());
    //redirect from protected routes for guests
    if (route.protected && appStore.getUser()?.role === 'guest'){
      console.log("Protected route")
      history.pushState({},"", '/WarriorsOnly')
      return document.createElement("not-allowed-page")
    }

    //redirect to dashboard if already logged in
    if (route.path === '/login'){
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
