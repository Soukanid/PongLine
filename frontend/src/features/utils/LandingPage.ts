import { router } from "../../core/Router";
import { BaseComponent } from "../../core/Component";

export class LandingPage extends BaseComponent {
  render(): void {
    this.setHtml(`
      <div class="">
      <div id="title-section" class="flex flex-col w-full mx-4 my-10  mt-30 items-center">
        <img src="pongline.png" alt="Pongline Logo" class="h-auto lg:w-2/3 mx-12 my-5" />
      </div>
      <div id="welcome-section" class=" flex flex-row w-full justify-center text-4xl text-center ">
        <p id="instructions" class="whitespace-pre-line text-center">
        <span
            class="cursor-blink inline-block ml-2 w-2 h-[1em] align-bottom bg-retro"
            ></span>
          </p>
      </div>
      </div>
      `);

  }

  private writeText(
  target: HTMLElement,
  content: string,
  delay: number = 10,
  before?: HTMLElement
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    const interval = setInterval(() => {

      if (before)
      {
const char = content[index];
      target.insertBefore(document.createTextNode(char),
    before);
      }
      else{
        target.textContent += content[index]
      }
            index++;

      if (index >= content.length) {
        clearInterval(interval);
        resolve();
      }
    }, delay);
  });
}

  private handleEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") { 
      window.removeEventListener("keydown", this.handleEnter);
      router.navigate("/dashboard");
    }
  };

  async  addEvents(): Promise<void> {
      const output = this.querySelector('#instructions') as HTMLElement;
      const cursor = this.querySelector('.cursor-blink') as HTMLElement;

      await this.writeText(output, "Welcome to Pongline universe\nClick Enter to start ...", 30,cursor)

    window.addEventListener("keydown", this.handleEnter);
  }

  disconnectedCallback(): void {
    window.removeEventListener("keydown", this.handleEnter);
  }
}

customElements.define("landing-page", LandingPage);
