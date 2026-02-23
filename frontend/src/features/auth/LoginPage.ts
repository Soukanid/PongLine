import { BaseComponent } from "../../core/Component";
import { TerminalUI } from "./terminalUI";
import { CommandController } from "./commandController";
import { LoginFlow } from "./loginFlow";
import { RegisterFlow } from "./registerFlow";
import { appStore } from "../../core/Store";
import { router } from "../../core/Router";

export class LoginPage extends BaseComponent {
  private terminal!: TerminalUI;
  private controller!: CommandController;

  render(): void {
    this.setHtml(`
      <div>
        <div id="logo-section" class="flex flex-col w-full px-10 mb-5 mt-25 items-center">
          <img src="pongline.png" alt="Pongline Logo" class="h-auto lg:w-2/5" />
        </div>
        <div id="terminal-section" class="flex flex-col w-full h-100 overflow-hidden text-4xl items-center justify-center">
          <div class="flex flex-col w-full items-center justify-center min-h-0 flex-1">
          <h2 class="m-5"> >> AUTHENTICATION REQUIRED << </h2>
            <div id="terminal-output" class="h-full space-y-4 overflow-y-auto lg:w-2/5 ">
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
      </div>
    `);
  }

  update(): void {
      const user = appStore.getUser()

      if (user) router.navigate("/dashboard");
  }

  addEvents(): void {

    this.update();

    this.terminal = new TerminalUI(this);
    this.terminal.init();

    this.controller = new CommandController();

    const loginFlow = new LoginFlow(this.terminal);
    const registerFlow = new RegisterFlow(this.terminal);

    this.controller.register("LOGIN", () => loginFlow.start());
    this.controller.register("REGISTER", () => registerFlow.start());
    this.controller.register("CLEAR", () => this.terminal.clear());
    this.controller.register("INTRA", () => loginFlow.intra());
    this.controller.register("GUEST", () => registerFlow.guest());
    this.controller.register("LS", () => {
      this.terminal.print("This is not your terminal 😝 ")
        this.terminal.showCommandLine();
        return true;
    })

    this.controller.register("HELP", () => {
      this.terminal.print("");
      this.terminal.print("HELP - Command Reference");
      this.terminal.print("━━━━━━━━━━");
      this.terminal.print("");
      this.terminal.print("LOGIN     : Access existing account.");
      this.terminal.print("REGISTER  : Create a new account.");
      this.terminal.print("INTRA  : Login or Register via 42 Intra.");
      this.terminal.print("GUEST  : Play without account.");
      this.terminal.print("CLEAR  : Clear the terminal.");
      this.terminal.print("");
      this.terminal.print("━━━━━━━━━━");
      this.terminal.print("");
      this.terminal.showCommandLine();
      return true;
    });

    this.terminal.onCommand((cmd) => {
      if (!this.controller.execute(cmd)) {
        this.terminal.print(`Error: Unknown command '${cmd}'`);
        this.terminal.print("Type HELP for available commands");
        this.terminal.showCommandLine();
      }
    });
  }
}

customElements.define("login-page", LoginPage);
