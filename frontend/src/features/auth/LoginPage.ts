import "../../css/login.css";
import { AuthService } from "./authService"
import { router } from "../../core/Router"
import { User } from "../../core/Types"
import { BaseComponent } from "../../core/Component";

export class LoginPage extends BaseComponent {

  render(): void{
  const container = document.createElement('div')
  container.id = "Login"

  const logoSection = document.createElement('div')
  logoSection.id = 'logo-section'
  logoSection.className = 'flex flex-col items-center justify-center mb-8 md:mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4'
  logoSection.innerHTML = '<img src="pongline.png" alt="Pongline Logo" class="w-full h-auto" />'

  const terminalSection = document.createElement('div')
  terminalSection.id = 'terminal-section'
  terminalSection.className = 'flex flex-col gap-4 md:gap-6 w-full h-100 max-w-4xl overflow-hidden text-2xl md:text-3xl lg:text-4xl items-center justify-center'
  terminalSection.innerHTML = `<div class="flex flex-col items-center justify-center min-h-0 flex-1"
    <div id="terminal-output" class="h-full space-y-4  overflow-y-auto">
      <!-- Terminal content will be injected here -->

      <!-- Command Input -->
      <div id="command-line" class="flex flex-row">
        <span class="mr-2">&gt;&gt;</span>
        <input
          type="text"
          id="command-input"
          placeholder="Type a command or HELP for guidance"
          class="w-full bg-transparent border-none outline-none "
          spellcheck="false"
        />
      </div>
    </div>
  </div>`

  container.appendChild(logoSection)
  container.appendChild(terminalSection)
  this.innerHTML = container.innerHTML

  }

  addEvents(): void {
   const commandInput = this.querySelector('#command-input') as HTMLElement;
  commandInput.addEventListener("keydown", (e) =>
    handleCommandInput(e),
  );

  function handleCommandInput( event: KeyboardEvent): void {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      const command = input.value.trim().toUpperCase();

      appendTerminalOutput(`>> ${input.value}`);
      input.value = "";

      processCommand(command);
    }

    // Handle up/down for command history
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  }

  function appendTerminalOutput(text: string): void {
    const output = document.getElementById("terminal-output");
    const command = document.getElementById("command-line");
    if (output) {
      const line = document.createElement("p");
      line.className = "animate-fadeIn";
      line.textContent = text;
      output.insertBefore(line, command);

      // Auto scroll to bottom
      output.scrollTop = output.scrollHeight;
    }
  }

  function processCommand(command: string): void {

    switch (command) {
      case "HELP":
        showHelp();
        break;
      case "LOGIN":
        showLogin();
        break;
      case "REGISTER":
        showRegister();
        break;
      case "42":
      case "INTRA":
      case "42 INTRA":
        show42Intra();
        break;
      case "BACK":
        clear();
        break;
      case "":
        // Empty command, do nothing
        break;
      default:
        appendTerminalOutput(`Error: Unknown command '${command}'`);
        appendTerminalOutput("Type HELP for available commands");
    }
  }

  function showHelp(): void {
    appendTerminalOutput("");
    appendTerminalOutput("HELP - Command Reference");
    appendTerminalOutput("━━━━━━━━━━");
    appendTerminalOutput("");
    appendTerminalOutput("LOGIN     : Access existing account.");
    appendTerminalOutput("REGISTER  : Create a new account.");
    appendTerminalOutput("INTRA  : Login or Register via 42 Intra.");
    appendTerminalOutput("");
    appendTerminalOutput("━━━━━━━━━━");
    appendTerminalOutput("");
  }

  function showLogin(): void {
    appendTerminalOutput("");
    const line = document.getElementById("command-line") as HTMLElement;
    line.classList.add("hidden");

    const form = document.createElement("form");
    form.action = "";
    form.method = "get";
    form.innerHTML = `
      <div class="flex flex-row">
        <label for="username">Username: </label>
        <input
          type="text"
          name="username"
          id="username"
          class="w-full bg-transparent border-none outline-none"
          autofocus
          required
        />
      </div>
      <div class="flex flex-row hidden" id="passwordiv">
        <label for="password">Password: </label>
        <input
          type="password"
          id="password"
          name="password"
          class="w-full bg-transparent border-none outline-none text-xs"
          required
	  autofocus
        />
      </div>
    `;
    appendTerminalOutput("Enter your credentials");
    appendTerminalElement(form);
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const passdiv = document.getElementById("passwordiv") as HTMLElement;
    if (username) {
      username.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key == "Enter") {
          if (!username.value) {
            appendTerminalOutput("Username required");
            return;
          }
          passdiv.classList.remove("hidden");
        }
      });
    }

    if (password && username) {
      password.addEventListener("keydown", async (e: KeyboardEvent) => {
        if (e.key == "Enter") {
          if (!password.value) {
            appendTerminalOutput("Password required");
            return;
          }
          appendTerminalOutput("Authenticating________");
          const user: User|null = await AuthService.login(username.value, password.value);
          
          if (user)
          {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect");

            redirect? router.navigate(redirect) : router.navigate('/dashboard')
          }
          username.id = "";
          password.id = "";
          line.classList.remove("hidden");
        }
      });
    }
      }

  function showRegister(): void {
    appendTerminalOutput("");
    appendTerminalOutput("REGISTER - Create New Account");
    appendTerminalOutput("━━━━━━━━━━");

    const commandLine = document.getElementById("command-line") as HTMLElement;
    if (commandLine) commandLine.classList.add("hidden");

    const form = document.createElement("div");
    form.className = "flex flex-col gap-2 mb-4"; 

    form.innerHTML = `
      <div class="flex flex-row" id="reg-step-1">
        <span class="mr-2 text-retro">Username:</span>
        <input type="text" id="reg-username" class="flex-1 bg-transparent border-none outline-none text-green-200" autocomplete="off" autofocus />
      </div>

      <div class="flex flex-row hidden" id="reg-step-2">
        <span class="mr-2 text-retro">Email:</span>
        <input type="email" id="reg-email" class="flex-1 bg-transparent border-none outline-none text-green-200" autocomplete="off" />
      </div>

      <div class="flex flex-row hidden" id="reg-step-3">
        <span class="mr-2 text-retro">Password:</span>
        <input type="password" id="reg-pass" class="flex-1 bg-transparent border-none outline-none text-green-200" />
      </div>
    `;

    appendTerminalElement(form);

    const userInput = form.querySelector("#reg-username") as HTMLInputElement;
    
    const emailRow = form.querySelector("#reg-step-2") as HTMLElement;
    const emailInput = form.querySelector("#reg-email") as HTMLInputElement;
    
    const passRow = form.querySelector("#reg-step-3") as HTMLElement;
    const passInput = form.querySelector("#reg-pass") as HTMLInputElement;

    setTimeout(() => userInput?.focus(), 50);

    userInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = userInput.value.trim();
        if (!val) {
             return; 
        }
        userInput.disabled = true;
        emailRow.classList.remove("hidden");
        emailInput.focus();
      }
    });

    emailInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = emailInput.value.trim();
        if (!val) return;

        emailInput.disabled = true;
        passRow.classList.remove("hidden");
        passInput.focus();
      }
    });

    passInput?.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        appendTerminalOutput(">> Processing...");

        const res = await AuthService.register(emailInput.value, 
          userInput.value, 
          passInput.value );

        if (res) {
          appendTerminalOutput(">> [SUCCESS] Account created!");
          appendTerminalOutput(">> Please 'LOGIN' to continue.");
      
        } else {
          appendTerminalOutput(">> [ERROR] Registration failed.");
        }
        userInput.id = ""
        emailInput.id = ""
        passInput.id = ""
        emailRow.id = ""
        userInput.id = ""
        document.getElementById("command-line")?.classList.remove("hidden");
       
      }
    });
  }

  function clear(): void {
    const commandLine = document.getElementById("command-line") as HTMLElement;
      const terminalOutput = document.getElementById("terminal-output");

    if (terminalOutput) {
      terminalOutput.innerHTML = "";
      terminalOutput.appendChild(commandLine)
      commandLine.focus();
    }
  }
  function appendTerminalElement(elem: HTMLElement): void {
    const output = document.getElementById("terminal-output");
    const command = document.getElementById("command-line");
    if (output) {
      output.insertBefore(elem, command);

      // Auto scroll to bottom
      output.scrollTop = output.scrollHeight;
    }
  }

  function show42Intra(): void{}
   
  }
  }

  customElements.define("login-page", LoginPage);
