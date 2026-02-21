import { router } from "../../core/Router";
import { AuthService } from "./authService";
import { TerminalUI } from "./terminalUI";

export class LoginFlow {
  private terminal: TerminalUI;

  constructor(terminal: TerminalUI) {
    this.terminal = terminal;
  }

  async start() {
    this.terminal.hideCommandLine();
    this.terminal.print("Enter your credentials");

    const form = document.createElement("form");
    form.className = "flex flex-row";
    form.innerHTML = `
      <div class="w-full bg-transparent border-none outline-none">
        <input type="text" placeholder="Username" id="username" required />
      </div>
      <div class="hidden w-full bg-transparent border-none outline-none">
        <input type="password" placeholder="Password" id="password" required />
      </div>
       <div class="hidden w-full bg-transparent border-none outline-none">
        <input type="tfacode" placeholder="2FA code" id="tfacode"/>
      </div>
    `;

    this.terminal.printElem(form);

    const username = form.querySelector("#username") as HTMLInputElement;
    const password = form.querySelector("#password") as HTMLInputElement;
    const tfacode = form.querySelector("#tfacode") as HTMLInputElement;

    username.focus();

    username.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!username.value) this.terminal.print("Username required");
        else {
          username.disabled = true;
          password.parentElement?.classList.remove("hidden");
          password.focus();
        }
      }
    });

    password.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!password.value) this.terminal.print("Password required");
        else {
          password.disabled = true;
          this.terminal.print("Authenticating...");

          const result = await AuthService.login(
            username.value,
            password.value,
          );

          if (result.success === "TFA") {
            this.terminal.print("2 Factor Authentication Enabled");
            this.terminal.print("Please Enter the 2FA code");
            tfacode.parentElement?.classList.remove("hidden");
            tfacode.focus();
            return true;
          }

          if (result.error) {
            this.terminal.print("Error : " + result.error);
            this.terminal.showCommandLine();
            return true;
          }

          this.terminal.print(" Login Successful");
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          router.navigate(redirect || "/dashboard");
        }
      }
    });

    tfacode.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!tfacode.value) this.terminal.print("2 FA code required");
        else {
          tfacode.disabled = true;
          this.terminal.print("Validating...");

          const result = await AuthService.tfaValidate(
            username.value,
            password.value,
            tfacode.value,
          );

          if (result.error) {
            this.terminal.print(result.error);
            this.terminal.showCommandLine();
            return true;
          }

          this.terminal.print(" Login Successful");
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          router.navigate(redirect || "/dashboard");
        }
      }
    });
    return true;
  }
}
