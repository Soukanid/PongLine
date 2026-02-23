// NotAllowedPage.ts
import { BaseComponent } from "../../core/Component";
import { router } from "../../core/Router";

export class NotAllowedPage extends BaseComponent {

  render(): void {
    this.setHtml(`
      <div class="flex flex-col items-center justify-center min-h-screen text-retro bg-black font-mono">

        <pre class="text-center text-sm md:text-base">
  █████╗  ██████╗  ██████╗ ███████╗███████╗███████╗
 ██╔══██╗██╔════╝ ██╔════╝ ██╔════╝██╔════╝██╔════╝
 ███████║██║      ██║      █████╗  ███████╗███████╗
 ██╔══██║██║      ██║      ██╔══╝  ╚════██║╚════██║
 ██║  ██║╚██████╔ ╚██████╗ ███████╗███████║███████║
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚══════╝
        </pre>

        <p class="mt-6 text-lg text-retro">
          You do not have permission to access this resource.
        </p>

        <button id="go-dashboard"
          class="mt-8 px-6 py-2 border border-retro hover:bg-retro hover:text-black transition">
          Go Back
        </button>

      </div>
    `);
  }

  addEvents(): void {
    const btn = this.querySelector("#go-dashboard");
    btn?.addEventListener("click", () => {
      router.navigate("/dashboard");
    });
  }
}

customElements.define("not-allowed-page", NotAllowedPage);
