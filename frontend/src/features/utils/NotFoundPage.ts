// NotFoundPage.ts
import { BaseComponent } from "../../core/Component";
import { router } from "../../core/Router";

export class NotFoundPage extends BaseComponent {

  render(): void {
    this.setHtml(`
      <div class="flex flex-col items-center justify-center min-h-screen text-retro bg-black font-mono">
        
        <pre class="text-center text-sm md:text-base">
 ███╗   ██╗ ██████╗ ████████╗    ███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ 
 ████╗  ██║██╔═══██╗╚══██╔══╝    ██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗
 ██╔██╗ ██║██║   ██║   ██║       █████╗  ██║   ██║██║   ██║██╔██╗ ██║██║  ██║
 ██║╚██╗██║██║   ██║   ██║       ██╔══╝  ██║   ██║██║   ██║██║╚██╗██║██║  ██║
 ██║ ╚████║╚██████╔╝   ██║       ██║     ╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝
 ╚═╝  ╚═══╝ ╚═════╝    ╚═╝       ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ 
        </pre>

        <p class="mt-6 text-lg text-retro">
          The page you are looking for does not exist.
        </p>

        <button id="go-home"
          class="mt-8 px-6 py-2 border border-retro hover:bg-retro hover:text-black transition">
          Return to Home
        </button>

      </div>
    `);
  }

  addEvents(): void {
    const btn = this.querySelector("#go-home");
    btn?.addEventListener("click", () => {
      router.navigate("/dashboard");
    });
  }
}

customElements.define("not-found-page", NotFoundPage);
