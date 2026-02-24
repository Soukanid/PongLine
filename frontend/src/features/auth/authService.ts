import { api } from "../../core/Client";
import { appStore } from "../../core/Store";
import { User } from "../../core/Types";


export class AuthService {

  static async init() {
    await this.setCurrentUser();
  }

  //guest controller
  static async guest(
    alias: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>("api/auth/guest", { alias }, {}, false);

      appStore.setUser({
        username: alias,
        id: "",
        role: "guest",
      });
      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //login controller
  static async login(
    email: string,
    password: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      const result = await api.post<{ tfa?: boolean }>(
        "api/auth/login",
        { email, password },
        {},
        false,
      );

      if (result.tfa) return { success: "TFA" };

      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //2fa controller
  static async tfaValidate(
    email: string,
    password: string,
    tfacode: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>(
        "api/auth/2fa/validate",
        {
          email,
          password,
          tfacode,
        },
        {},
        false,
      );

      return { success: "logged in" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //register controller
  static async register(
    email: string,
    username: string,
    password: string,
  ): Promise<{ success?: string; error?: string }> {
    try {
      await api.post<{}>(
        "api/auth/register",
        {
          email,
          username,
          password,
        },
        {},
        false,
      );
      return { success: "account created" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //42 intra controller
  static async intra(): Promise<{ success?: string; error?: string }> {
    try {
      await api.get<{}>("api/auth/42/login", {}, false);

      return { success: "42 login successful" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //logout controller
  static async logout(): Promise<{ success?: string; error?: string }> {
    try {
      if (appStore.getUser()?.role !== "guest"){
        await api.post<{ success?: string; error?: string }>(
          "api/user-management/online",
          { id: appStore.getUser()?.id ,isOnline: false },
        );
      }
      await api.post<{ success?: string; error?: string }>(
        "api/auth/logout",
        {},
      );

      appStore.setUser(null);
      await Promise.resolve();
      window.location.href = "/login";

      return { success: "logged out" };
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
      else return { error: "something went wrong" };
    }
  }

  //fetching and setting the appStore.user information
  static async setCurrentUser(): Promise<void> {
    try {
      const me = await api.get<User>("api/user-management/me", {});
      me.role = "warrior";
      appStore.setUser(me);
    } catch {
      appStore.setUser(null);
    }
  }

  //checking if appStore.user is set means logged in
  static isAuthenticated(): boolean {
    return !!appStore.getUser();
  }
}
