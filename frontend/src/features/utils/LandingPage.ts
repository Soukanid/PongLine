import "../../css/login.css";
import { router } from "../../core/Router";
import { BaseComponent } from "../../core/Component";

export class LandingPage extends BaseComponent {

  render(): void {
   const container = document.createElement("div");
  container.className = "Landing";

  const titleSection = document.createElement("div");
  titleSection.id = "title-section";
  titleSection.className =
    "flex flex-col items-center justify-center mb-8 md:mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4";
  titleSection.innerHTML =
    '<img src="pongline.png" alt="Pongline Logo" class="w-full h-auto" />';

  const welcomeSection = document.createElement("div");
  welcomeSection.id = "welcome-section";
  welcomeSection.className =
    "flex flex-col gap-4 md:gap-6 w-full max-w-4xl overflow-hidden text-2xl md:text-3xl lg:text-4xl items-center justify-center";
  welcomeSection.innerHTML = `<p>
        <span class="mr-2">&gt;&gt;</span>
        Welcome to Pongline universe
        <br />
        <span class="mr-2">&gt;&gt;</span>
        Click Enter to start ...
        <span
            class="cursor-blink ml-2 inline-block w-2 h-6 md:h-7 lg:h-8 bg-[#1bfb08]"
            ></span>
        </p>`;

  container.appendChild(titleSection);
  container.appendChild(welcomeSection);
   
  this.innerHTML = container.innerHTML
  }

  addEvents(): void {
     this.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      router.navigate("/dashboard");
    }
  }); 
  }
}

customElements.define("landing-page", LandingPage);
