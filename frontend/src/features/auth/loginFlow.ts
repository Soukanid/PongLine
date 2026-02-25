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
    this.terminal.print("Enter your credentials :");

    const form = document.createElement("div");
    form.className = "flex flex-col";
    form.innerHTML = `
      <div class="w-full bg-transparent border-none outline-none">
        <label for="email">Email :</label>
        <input type="email" placeholder="flan@frtlan.com" id="email" required />
      </div>
      <div class="hidden w-full bg-transparent border-none outline-none">
        <label for="password">Password :</label>
        <input type="password" placeholder="ifta7 ya simsim" id="password" required />
      </div>
           `;

    this.terminal.printElem(form);

    const email = form.querySelector("#email") as HTMLInputElement;
    const password = form.querySelector("#password") as HTMLInputElement;
    const tfadiv = document.createElement('div');
    tfadiv.innerText = `<div >
    <label for="tfacode">2FA Code :</label>
	    <input type="number" placeholder="ha lm39ool" id="tfacode"/>
    `;
    tfadiv.classList.add('w-full ','bg-transparent ','border-none' ,'outline-none');
    const tfacode = tfadiv.querySelector("#tfacode") as HTMLInputElement;

    email.focus();

    email.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!email.value) this.terminal.printError("email required");
        else {
          this.terminal.removeError();
          email.disabled = true;
          password.parentElement?.classList.remove("hidden");
          password.focus();
        }
      }
    });

    password.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!password.value) this.terminal.printError("Password required");
        else {
          password.disabled = true;
          this.terminal.printError("Authenticating...");

          const result = await AuthService.login(
            email.value,
            password.value,
          );

          this.terminal.removeError();

          if (result.success === "TFA") {
            this.terminal.print("2 Factor Authentication Required");
            this.terminal.print("Please Enter the 2FA code");
	    form.appendChild(tfadiv);
            tfacode.focus();
          }
          else if (result.success === "logged in"){
            await AuthService.setCurrentUser();
            this.terminal.print(" Login Successful");
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");
            router.navigate(redirect || "/dashboard");
          }

          if (result.error) {
            this.terminal.print("Error : " + result.error);
            this.terminal.showCommandLine();
          }
        }
      }
      return true;
    });

    tfacode.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        if (!tfacode.value) this.terminal.printError("2FA code required");
        else {
          tfacode.disabled = true;
          this.terminal.printError("Validating...");

          const result = await AuthService.tfaValidate(
            email.value,
            password.value,
            tfacode.value,
          );

          this.terminal.removeError();

          if (result.success) {
            await AuthService.setCurrentUser();
            this.terminal.print(" Login Successful");
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");
            router.navigate(redirect || "/dashboard");
          }

          if (result.error) {
            this.terminal.print(result.error);
            this.terminal.showCommandLine();
          }
        }
      }
    });

    return true;
  }

  async intra() {
    window.location.assign(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/42/login`);
    
    this.terminal.print("Redirecting to...");

    const pre = document.createElement("pre");
    
    pre.textContent = `
       ██╗  ████╗
      ██╔╝  █  ██║ 
     ██╔╝     ██║
    ██████╗  █████║
        ██║  ╚════╝
        ╚═╝            
`;

    pre.style.lineHeight = "1";
    pre.style.letterSpacing = "0";
    pre.style.fontSize = "1rem";
    pre.style.fontFamily = "'Courier New', Consolas, monospace";
    pre.style.color = "inherit";

    this.terminal.printElem(pre);
    
    return true;
  }
}
