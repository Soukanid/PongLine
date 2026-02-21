import { api } from "../../core/Client";
import { appStore } from "../../core/Store";
import { User } from "../../core/Types";


export class AuthService {
  static async init() {
    await this.setCurrentUser();
  }
  static async guest(
    alias: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>("api/auth/guest", {alias});

      appStore.setUser({
        username: alias,
        id: '',
        email:""
      })
      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }
  static async login(
    email: string,
    password: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      const result = await api.post<{ tfa?: boolean }>("api/auth/login", {
        email,
        password,
      });

      if (result.tfa) return { success: "TFA" };

      await this.setCurrentUser();
      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  static async tfaValidate(
    email: string,
    password: string,
    tfacode: string
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>("api/auth/2fa/validate", {
        email,
        password,
        tfacode
      });

      await this.setCurrentUser();
      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  static async register(
    email: string,
    username: string,
    password: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>("api/auth/register", {
        email,
        username,
        password,
      });
      return {success: "account created"}
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  static async intra(): Promise<{success?: string; error?: string}> {
    try {
      await api.get<{}>("api/auth/42/login",{});

      return {success: "42 login successful"}
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  static async logout() {
    appStore.setUser(null);
    await api.get<{}>("api/auth/logout", {});
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
}
