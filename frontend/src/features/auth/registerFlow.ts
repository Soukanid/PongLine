import { AuthService } from "./authService";
import { TerminalUI } from "./terminalUI";
import { router } from "../../core/Router";

export class RegisterFlow {
  private terminal: TerminalUI;

  constructor(terminal: TerminalUI) {
    this.terminal = terminal;
  }

  async guest() {
    this.terminal.hideCommandLine();
    this.terminal.print("Please enter your alias :");

    const form = document.createElement("form");
    form.innerHTML = `
      <div class="w-full bg-transparent border-none outline-none">
        <input type="text" placeholder="Alias" id="alias" required />
      </div>`;
    this.terminal.printElem(form);

    const alias = form.querySelector("#alias") as HTMLInputElement;

    alias.focus();
    alias.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!alias.value) this.terminal.print("Alias required");
        else {
          const result = await AuthService.guest(alias.value);

          if (result.error) this.terminal.print("Error : " + result.error);
          if (result.success) {
            this.terminal.print(" Starting ...");
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");
            router.navigate(redirect || "/dashboard");
          }
        }
      }
      return true;
    });
  }

  async start() {
    this.terminal.hideCommandLine();
    this.terminal.print("Create new account");

    const form = document.createElement("form");
    form.innerHTML = `
      <div class="w-full bg-transparent border-none outline-none">
        <input type="email" placeholder="Email" id="email" required />
      </div>
      <div class="hidden w-full bg-transparent border-none outline-none">
        <input type="text" placeholder="Username" id="username" required />
      </div>
      <div class="hidden w-full bg-transparent border-none outline-none">
        <input type="password" placeholder="Password" id="password" required />
      </div>
    `;

    this.terminal.printElem(form);

    const username = form.querySelector("#username") as HTMLInputElement;
    const email = form.querySelector("#email") as HTMLInputElement;
    const password = form.querySelector("#password") as HTMLInputElement;

    email.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!email.value) this.terminal.print("Email required");
        else username.parentElement?.classList.remove("hidden");
      }
    });

    username.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!username.value) this.terminal.print("Username required");
        else password.parentElement?.classList.remove("hidden");
      }
    });

    password.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!password.value) this.terminal.print("Password required");
        else {
          this.terminal.print("Registering...");

          const result = await AuthService.register(
            email.value,
            username.value,
            password.value,
          );

          if (result.error) this.terminal.print("Error : " + result.error);
          else {
            this.terminal.print("Account created successfully");
            this.terminal.print("Please login to proceed");
          }
          this.terminal.showCommandLine();
        }
      }
    });
          return true;
  }
}
