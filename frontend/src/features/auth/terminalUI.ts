export class TerminalUI {
  private root!: HTMLElement;
  private output!: HTMLElement;
  private commandLine!: HTMLElement;
  private input!: HTMLInputElement;
  private commandHandler?: (cmd: string) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.output = this.root.querySelector("#terminal-output")!;
    this.commandLine = this.root.querySelector("#command-line")!;
    this.input = this.root.querySelector("#command-input")!;
  }

  init() {
    this.input.focus();
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = this.input.value.trim();
        this.print(`>>${value}`);
        this.input.value = "";
        this.commandHandler?.(value.toUpperCase());
      }
    });
  }

  onCommand(handler: (cmd: string) => void) {
    this.commandHandler = handler;
  }

  print(text: string) {
    const line = document.createElement("p");
    line.textContent = text;
    this.output.insertBefore(line, this.commandLine);
    requestAnimationFrame(()=>{
      this.output.scrollTop = this.output.scrollHeight;
    });
  }

  printElem(elem: HTMLElement) {
    this.output.insertBefore(elem, this.commandLine);
    requestAnimationFrame(()=>{
      this.output.scrollTop = this.output.scrollHeight;
    });
  }

  removeError(){
    const err = document.querySelector('#error-p')
    if (err)
      err.remove();
  }

  printError(text: string){
    this.removeError();
    const err = document.createElement('p');
    err.id = 'error-p'
    err.textContent = text;
    this.printElem(err);
  }

  hideCommandLine() {
    this.input.disabled = true;
    this.commandLine.classList.add("hidden");
  }

  showCommandLine() {
    this.input.disabled = false;
    this.commandLine.classList.remove("hidden");
    this.input.focus();
  }

  clear() {
    this.output.innerHTML = "";
    this.output.appendChild(this.commandLine);
    this.showCommandLine();
  }
}