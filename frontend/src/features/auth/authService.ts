import { userCreateData } from "./types";
import { api } from "../../core/Client";
import { appStore } from "../../core/Store";
import { User } from "../../core/Types";


export class AuthService {
  static async init() {
    await this.setCurrentUser();
  }

  static async login(email: string, password: string): Promise<User | null> {
    await api.post<{}>("api/auth/login", { email, password });

    await this.setCurrentUser();

    return appStore.getUser();
  }

  static async register(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const response = await api.post<{
      user: User;
    }>("api/auth/register", { email, username, password });
    appStore.setUser(response.user);

    return response.user;
  }

  static async logout() {
    appStore.setUser(null);
    await api.get<{}>("api/auth/logout",{});
  }

  static async setCurrentUser(): Promise<void> {
    try {
      const me = await api.get<User>("api/user-management/me", {});

      appStore.setUser(me);
    } catch {
      appStore.setUser(null);
    }
  }

  static isAuthenticated(): boolean {
    return !!appStore.getUser();
  }

  async createUser(data: userCreateData) {
    const url = new URL(
      `${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/register`,
    );

    try {
      const response = await fetch(`${url}`.toString(), {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response;
    } catch (error) {
      console.log("could not fetsh the user data");
      return null;
    }
  }

  async loginUser(identifier: string, password: string) {
    const url = new URL(
      `${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/login`,
    );

    try {
      const response = await fetch(`${url}`.toString(), {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password: password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      return { success: true };
    } catch (error) {
      console.log("Login error", error);
      return null;
    }
  }
}
