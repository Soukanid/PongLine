import "../../css/login.css";
import { BaseComponent } from "../../core/Component";
import { authService } from "./authService"
import  { userCreateData } from "./types"

export class LoginPage extends BaseComponent {
  render() {
    this.setHtml(`
     <div id="title-section" class="flex flex-col items-center justify-center mb-8 md:mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4">
        <img src="pongline.png" alt="Pongline Logo" class="w-full h-auto" />
    </div>

    <div class="flex flex-col gap-4 md:gap-6 w-full max-w-4xl overflow-hidden text-2xl md:text-3xl lg:text-4xl items-center justify-center">
      <div id="welcome-section" class="">
        <p>
        <span class="mr-2">&gt;&gt;</span>
        Welcome to Pongline universe
        <br />
        <span class="mr-2">&gt;&gt;</span>
        Click Enter to start ...
        <span
            class="cursor-blink ml-2 inline-block w-2 h-6 md:h-7 lg:h-8 bg-[#1bfb08]"
            ></span>
        </p>
      </div>
      <!-- Terminal Output Section (hidden initially) -->
      <div id="terminal-section" class="hidden flex flex-col items-center justify-center min-h-0 flex-1">
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

              </div>
    </div>
    `);
  }

  addEvents(): void {
    setTimeout(() => {
      const welcome = document.getElementById("Welcome-section");
      const commandInput = document.getElementById(
        "command-input",
      ) as HTMLInputElement;

      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") this.handleStart(e);
      });

      if (commandInput) {
        commandInput.addEventListener("keydown", (e) =>
          this.handleCommandInput(e),
        );
      }
    }, 100);
  }

  private handleStart(event: KeyboardEvent): void {
    const terminalSection = document.getElementById("terminal-section");
    const commandInput = document.getElementById(
      "command-input",
    ) as HTMLInputElement;
    const welcomeSection = document.getElementById(
      "welcome-section",
    ) as HTMLInputElement;

    if (!welcomeSection.classList.contains("hidden")) {
      if (terminalSection) {
        const parent = welcomeSection.parentElement as HTMLInputElement;
        welcomeSection.classList.add("hidden");
        //for the scroll effect
        parent.classList.add("h-100");
        terminalSection.classList.remove("hidden");
        this.appendTerminalOutput(">>> AUTHENTICATION REQUIRED <<<");
        this.appendTerminalOutput("");
        // Focus command input
        setTimeout(() => {
          commandInput?.focus();
        }, 100);
      }
    }
  }

  private handleCommandInput(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      const command = input.value.trim().toUpperCase();

      this.appendTerminalOutput(`>> ${input.value}`);
      input.value = "";

      this.processCommand(command);
    }

    // Handle up/down for command history
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  }

  private processCommand(command: string): void {
    const statusIndicator = document.getElementById("status-indicator");

    switch (command) {
      case "HELP":
        this.showHelp();
        break;
      case "LOGIN":
        this.showLogin();
        break;
      case "REGISTER":
        this.showRegister();
        break;
      case "42":
      case "INTRA":
      case "42 INTRA":
        this.show42Intra();
        break;
      case "BACK":
        this.goBack();
        break;
      case "":
        // Empty command, do nothing
        break;
      default:
        this.appendTerminalOutput(`Error: Unknown command '${command}'`);
        this.appendTerminalOutput("Type HELP for available commands");
    }

    if (statusIndicator && command !== "") {
      statusIndicator.textContent = "PROCESSING...";
      statusIndicator.className = "text-blue-400";

      setTimeout(() => {
        statusIndicator.textContent = "AUTH REQUIRED";
        statusIndicator.className = "text-yellow-400";
      }, 500);
    }
  }

  private showHelp(): void {
    this.appendTerminalOutput("");
    this.appendTerminalOutput("HELP - Command Reference");
    this.appendTerminalOutput("━━━━━━━━━━");
    this.appendTerminalOutput("");
    this.appendTerminalOutput("LOGIN     : Access existing account.");
    this.appendTerminalOutput("REGISTER  : Create a new account.");
    this.appendTerminalOutput("INTRA  : Login or Register via 42 Intra.");
    this.appendTerminalOutput("");
    this.appendTerminalOutput("━━━━━━━━━━");
    this.appendTerminalOutput("");
  }

  private login(): void {
    console.log("hello");
  }

  private showLogin(): void {
    this.appendTerminalOutput("");
    const line = document.getElementById("command-line") as HTMLElement;
    line.classList.add("hidden");

    const form = document.createElement("form");
    form.action = "";
    form.method = "get";
    form.onsubmit = this.login;
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
    this.appendTerminalOutput("Enter your credentials");
    this.appendTerminalElement(form);
    const username = document.getElementById("username") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const passdiv = document.getElementById("passwordiv");
    if (username) {
      username.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key == "Enter") {
          if (!username.value) {
            this.appendTerminalOutput("Username required");
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
            this.appendTerminalOutput("Password required");
            return;
          }
          this.appendTerminalOutput("Authenticating________");
          const res = await authService.login(username.value, password.value);
          
          // set token in localStorage
          if (res && res.success)
          {
            this.appendTerminalOutput("Welcome back Warrior");
            this.appendTerminalOutput("");

            // localStorage.setItem("accessToken", res.token);
          }
          line.classList.remove("hidden");
        }
      });
    }
  }

private showRegister(): void {
    this.appendTerminalOutput("");
    this.appendTerminalOutput("REGISTER - Create New Account");
    this.appendTerminalOutput("━━━━━━━━━━");

    const commandLine = document.getElementById("command-line") as HTMLElement;
    if (commandLine) commandLine.classList.add("hidden");

    const container = document.createElement("div");
    container.className = "flex flex-col gap-2 mb-4"; 

    container.innerHTML = `
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

    this.appendTerminalElement(container);

    const userRow = container.querySelector("#reg-step-1") as HTMLElement;
    const userInput = container.querySelector("#reg-username") as HTMLInputElement;
    
    const emailRow = container.querySelector("#reg-step-2") as HTMLElement;
    const emailInput = container.querySelector("#reg-email") as HTMLInputElement;
    
    const passRow = container.querySelector("#reg-step-3") as HTMLElement;
    const passInput = container.querySelector("#reg-pass") as HTMLInputElement;

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

    this.appendTerminalOutput(">> Processing...");

    const data = { 
        email: emailInput.value, 
        username: userInput.value, 
        password: passInput.value 
    };

    const res = await authService.createUser(data);

    if (res && res.ok) {
      this.appendTerminalOutput(">> [SUCCESS] Account created!");
      this.appendTerminalOutput(">> Please type 'LOGIN' to continue.");
      
      document.getElementById("command-line")?.classList.remove("hidden");
    } else {
      this.appendTerminalOutput(">> [ERROR] Registration failed.");
      passInput.disabled = false;
      passInput.focus();
    }
  }
  });
  }

  private goBack(): void {
    const titleSection = document.getElementById("title-section");
    const terminalSection = document.getElementById("terminal-section");
    const statusIndicator = document.getElementById("status-indicator");

    if (titleSection && terminalSection) {
      // Reset title section
      titleSection.classList.remove("flex-[0.3]", "py-4");
      titleSection.classList.add("flex-1");

      // Hide terminal
      terminalSection.classList.add("hidden");
      terminalSection.classList.remove("flex");

      // Clear terminal output
      const output = document.getElementById("terminal-output");
      if (output) output.innerHTML = "";

      // Reset status
      if (statusIndicator) {
        statusIndicator.textContent = "READY";
        statusIndicator.className = "text-retro-400";
      }

      // Focus start button
      const startBtn = document.getElementById("start-btn");
      startBtn?.focus();
    }
  }

  private appendTerminalOutput(text: string): void {
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
  private appendTerminalElement(elem: HTMLElement): void {
    const output = document.getElementById("terminal-output");
    const command = document.getElementById("command-line");
    if (output) {
      output.insertBefore(elem, command);

      // Auto scroll to bottom
      output.scrollTop = output.scrollHeight;
    }
  }
}
customElements.define("login-page", LoginPage);
