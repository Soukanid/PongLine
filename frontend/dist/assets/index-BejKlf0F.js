(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const u of n.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&a(u)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();class I{baseUrl;constructor(e="undefined"){this.baseUrl=e}async request(e,t,a,s){const n=`${this.baseUrl}${t}`,u={"Content-Type":"application/json",...s?.headers},y={method:e,headers:u,...s};a&&(y.body=JSON.stringify(a));const p=await fetch(n,y),x=await p.json();if(!p.ok)throw p.status===401&&(window.location.href="/login"),new Error(x.error||"Request failed");return x}async get(e,t){return this.request("GET",e,void 0,t)}async post(e,t,a){return this.request("POST",e,t,a)}async put(e,t,a){return this.request("PUT",e,t,a)}async patch(e,t,a){return this.request("PATCH",e,t,a)}async delete(e,t){return this.request("DELETE",e,void 0,t)}}const v=new I;class P{state={};user=null;listeners=[];getState(){return this.state}getUser(){return this.user}setState(e){this.state={...this.state,...e},this.listeners.forEach(t=>t())}setUser(e){this.user=e,this.notify()}subscribe(e){return this.listeners.push(e),()=>{this.listeners=this.listeners.filter(t=>t!==e)}}notify(){this.listeners.forEach(e=>e())}}const m=new P;class w{static async init(){if(await cookieStore.get("access_token"))try{const t=await this.getCurrentUser();m.setUser(t)}catch{cookieStore.delete("access_token"),m.setUser(null)}}static async login(e,t){const a=await v.post("/api/auth/login",{email:e,password:t});return m.setUser(a.user),a.user}static async register(e,t,a){const s=await v.post("/api/auth/register",{email:e,username:t,password:a});return m.setUser(s.user),s.user}static async logout(){cookieStore.delete("access_token"),m.setUser(null)}static async getCurrentUser(){return await v.get("/users")}static isAuthenticated(){return!!cookieStore.get("access_token")&&!!m.getUser()}async createUser(e){const t=new URL("undefined/api/auth/register");try{return await fetch(`${t}`.toString(),{method:"POST",headers:{"content-Type":"application/json"},body:JSON.stringify(e)})}catch{return console.log("could not fetsh the user data"),null}}async loginUser(e,t){const a=new URL("undefined/api/auth/login");try{const s=await fetch(`${a}`.toString(),{method:"POST",headers:{"content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:e,password:t})});if(!s.ok){const n=await s.json();throw new Error(n.error)}return{success:!0}}catch(s){return console.log("Login error",s),null}}}function k(){const o=document.createElement("div");o.id="Login";const e=document.createElement("div");e.id="logo-section",e.className="flex flex-col items-center justify-center mb-8 md:mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4",e.innerHTML='<img src="pongline.png" alt="Pongline Logo" class="w-full h-auto" />';const t=document.createElement("div");t.id="terminal-section",t.className="flex flex-col gap-4 md:gap-6 w-full h-100 max-w-4xl overflow-hidden text-2xl md:text-3xl lg:text-4xl items-center justify-center",t.innerHTML=`<div class="flex flex-col items-center justify-center min-h-0 flex-1"
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
  </div>`,o.appendChild(e),o.appendChild(t),t.querySelector("#command-input").addEventListener("keydown",i=>s(i));function s(i){if(i.key==="Enter"){const r=i.target,c=r.value.trim().toUpperCase();n(`>> ${r.value}`),r.value="",u(c)}(i.key==="ArrowUp"||i.key==="ArrowDown")&&i.preventDefault()}function n(i){const r=document.getElementById("terminal-output"),c=document.getElementById("command-line");if(r){const l=document.createElement("p");l.className="animate-fadeIn",l.textContent=i,r.insertBefore(l,c),r.scrollTop=r.scrollHeight}}function u(i){switch(i){case"HELP":y();break;case"LOGIN":p();break;case"REGISTER":x();break;case"42":case"INTRA":case"42 INTRA":break;case"BACK":T();break;case"":break;default:n(`Error: Unknown command '${i}'`),n("Type HELP for available commands")}}function y(){n(""),n("HELP - Command Reference"),n("━━━━━━━━━━"),n(""),n("LOGIN     : Access existing account."),n("REGISTER  : Create a new account."),n("INTRA  : Login or Register via 42 Intra."),n(""),n("━━━━━━━━━━"),n("")}function p(){n("");const i=document.getElementById("command-line");i.classList.add("hidden");const r=document.createElement("form");r.action="",r.method="get",r.innerHTML=`
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
    `,n("Enter your credentials"),b(r);const c=document.getElementById("username"),l=document.getElementById("password"),d=document.getElementById("passwordiv");c&&c.addEventListener("keydown",f=>{if(f.key=="Enter"){if(!c.value){n("Username required");return}d.classList.remove("hidden")}}),l&&c&&l.addEventListener("keydown",async f=>{if(f.key=="Enter"){if(!l.value){n("Password required");return}n("Authenticating________"),await w.login(c.value,l.value)&&(n("Welcome back Warrior"),n(""),E.navigate("/dashboard")),c.id="",l.id="",i.classList.remove("hidden")}})}function x(){n(""),n("REGISTER - Create New Account"),n("━━━━━━━━━━");const i=document.getElementById("command-line");i&&i.classList.add("hidden");const r=document.createElement("div");r.className="flex flex-col gap-2 mb-4",r.innerHTML=`
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
    `,b(r);const c=r.querySelector("#reg-username"),l=r.querySelector("#reg-step-2"),d=r.querySelector("#reg-email"),f=r.querySelector("#reg-step-3"),g=r.querySelector("#reg-pass");setTimeout(()=>c?.focus(),50),c?.addEventListener("keydown",h=>{if(h.key==="Enter"){if(!c.value.trim())return;c.disabled=!0,l.classList.remove("hidden"),d.focus()}}),d?.addEventListener("keydown",h=>{if(h.key==="Enter"){if(!d.value.trim())return;d.disabled=!0,f.classList.remove("hidden"),g.focus()}}),g?.addEventListener("keydown",async h=>{h.key==="Enter"&&(n(">> Processing..."),await w.register(d.value,c.value,g.value)?(n(">> [SUCCESS] Account created!"),n(">> Please 'LOGIN' to continue.")):n(">> [ERROR] Registration failed."),c.id="",d.id="",g.id="",l.id="",c.id="",document.getElementById("command-line")?.classList.remove("hidden"))})}function T(){const i=document.getElementById("command-line"),r=document.getElementById("terminal-output");r&&(r.innerHTML="",r.appendChild(i),i.focus())}function b(i){const r=document.getElementById("terminal-output"),c=document.getElementById("command-line");r&&(r.insertBefore(i,c),r.scrollTop=r.scrollHeight)}return o}function U(){const o=document.createElement("div");o.className="Landing";const e=document.createElement("div");e.id="title-section",e.className="flex flex-col items-center justify-center mb-8 md:mb-12 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4",e.innerHTML='<img src="pongline.png" alt="Pongline Logo" class="w-full h-auto" />';const t=document.createElement("div");return t.id="welcome-section",t.className="flex flex-col gap-4 md:gap-6 w-full max-w-4xl overflow-hidden text-2xl md:text-3xl lg:text-4xl items-center justify-center",t.innerHTML=`<p>
        <span class="mr-2">&gt;&gt;</span>
        Welcome to Pongline universe
        <br />
        <span class="mr-2">&gt;&gt;</span>
        Click Enter to start ...
        <span
            class="cursor-blink ml-2 inline-block w-2 h-6 md:h-7 lg:h-8 bg-[#1bfb08]"
            ></span>
        </p>`,o.appendChild(e),o.appendChild(t),o.addEventListener("keypress",a=>{a.key==="Enter"&&E.navigate("/dashboard")}),o}function S(){const o=document.createElement("div");return o.id="Notfound",o.innerHTML=" <h1> 404 PAGE NOT FOUND </h1>",o}const N=[{path:"/",page:U},{path:"/login",page:k}],E={async resolve(o){const e=N.find(t=>this.matchPath(t.path,o));return e?w.isAuthenticated()?o==="/login"&&w.isAuthenticated()?(console.log("login but authenticated"),window.location.href="/",S()):(console.log("out of resolve"),e.page()):(console.log("not authenticated"),window.location.href="/login",k()):(console.log("route not found"),S())},matchPath(o,e){if(o.includes(":")){const t=o.split("/"),a=e.split("/");return t.length!==a.length?!1:t.every((s,n)=>s.startsWith(":")||s===a[n])}return o===e},navigate(o){window.history.pushState({},"",o),window.dispatchEvent(new PopStateEvent("popstate"))}};class C{currentPage=null;constructor(){this.init()}async init(){await w.init(),window.addEventListener("popstate",()=>this.render()),this.render()}async render(){const e=window.location.pathname,t=await E.resolve(e);this.currentPage&&this.currentPage.remove(),this.currentPage=t,document.getElementById("app")?.appendChild(t)}}new C;
