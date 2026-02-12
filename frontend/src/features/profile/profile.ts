import { BaseComponent } from "../../core/Component";
import tournIcon from "./../../../public/tourn.png";
import gameIcon from "./../../../public/game.png";

export class ProfilePage extends BaseComponent {

render() {
  this.setHtml(`
    <div class="h-screen text-retro font-mono p-6 flex gap-6 select-none overflow-hidden">
      
      <div class="flex-1 flex flex-col gap-6 h-full pb-30">
        
        <div class="border border-retro p-4 flex items-start gap-8 relative shrink-0">
          <div class="text-xs leading-none whitespace-pre animate-pulse hidden md:block">
((_ , ... , _))
  |  o  o  |
   \\  /  /
    ^ _ ^
          </div>
          <

          <div class="flex-1 space-y-2">
            <div class="flex justify-between items-end">
              <h2 class="text-xl font-bold tracking-widest truncate">THE LEGEND Soukaina</h2>
              <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                <span class="hidden sm:inline">++++++++++++++</span>
                <span>20 Wins</span>
              </div>
            </div>

            <div class="flex justify-between items-end">
              <p>Ranking : 20 th</p>
              <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                <span class="hidden sm:inline">================</span>
                <span>30 draws</span>
              </div>
            </div>

            <div class="flex justify-between items-end">
              <p>Nb game played : 200</p>
              <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                <span class="hidden sm:inline">-------</span>
                <span>10 loses</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 border border-retro/50 rounded-sm p-4 relative flex flex-col min-h-0">
           <p class="text-retro/30 text-[10px] uppercase tracking-widest mb-2 border-b border-retro/20 shrink-0">>> System_Log</p>
           
           <div class="overflow-y-auto flex-1 custom-scrollbar space-y-1">
               <p class="text-retro/30 text-xs italic">> System idle...</p>
               <p class="text-retro/30 text-xs italic">> No recent activity found.</p>
               <p class="text-retro/30 text-xs italic">> Secure connection established.</p>
           </div>
           
           <button id="btn-settings" class="absolute bottom-2 right-4 text-xs hover:underline opacity-60 hover:opacity-100 transition-opacity">
              [ SYSTEM_CONFIG ]
           </button>
        </div>

      </div>

      <div class="flex-1 border border-retro/50 rounded-sm p-4 flex flex-col gap-4 bg-retro/5 mb-30">
        
        <div class="flex flex-row gap-4 w-full shrink-0">
          <button id="btn-tournament" class="flex-1 group border border-retro py-4 flex cursor-pointer flex-col items-center gap-2 hover:bg-retro hover:text-black transition-all duration-300">
            <div class="h-10 w-10 flex items-center justify-center">
               <img src='${tournIcon}' class=" h-full w-full object-contain filter group-hover:brightness-0"> 
            </div>
            <span class="text-[10px] uppercase tracking-tighter font-bold">Tournament</span>
          </button>

          <button id="btn-pingpong" class="flex-1 group border border-retro cursor-pointer py-4 flex flex-col items-center gap-2 hover:bg-retro hover:text-black transition-all duration-300">
            <div class="h-10 w-10 flex items-center justify-center">
               <img src='${gameIcon}' class="h-full w-full object-contain filter group-hover:brightness-0"> 
            </div>
            <span class="text-[10px] uppercase tracking-tighter font-bold">Ping Pong</span>
          </button>
        </div>

        <div class="flex-1 border-t border-retro/30 pt-4 flex flex-col overflow-hidden min-h-0">
          <h3 class="text-xs text-retro/70 uppercase mb-3 flex items-center gap-2 shrink-0">
            <span class="animate-pulse">●</span> Active_Brackets
          </h3>
          <div id="tournament-list" class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <div class="flex justify-between items-center text-[10px] border border-retro/20 p-3 hover:border-retro cursor-pointer">
                  <span>Alpha Cup</span>
                  <span class="animate-pulse text-retro">LIVE</span>
              </div>
          </div>
        </div>
        <div id="tournament-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        
        <div class="border-2 border-retro  p-8 w-[400px] shadow-[0_0_20px_rgba(0,255,0,0.2)] relative">
          
          <button id="close-modal" class="absolute top-2 right-4 text-retro/50 hover:text-retro text-xl font-bold">[X]</button>
          
          <h2 class="text-xl font-bold mb-6 text-center animate-pulse">> ACCESS_TOURNAMENT</h2>
          
          <div class="mb-6">
            <label class="block text-xs text-retro/70 mb-2 uppercase tracking-widest">Target Identifier</label>
            <input id="tournament-input" type="text" 
              class="w-full bg-transparent border-b border-retro py-2 text-center text-lg focus:outline-none placeholder-retro/30"
              placeholder="ENTER NAME OR CODE">
            <p class="text-[10px] text-retro/40 mt-2 text-center italic">* Use a Name to Create, or a Code to Join *</p>
          </div>

          <div class="flex gap-4">
            <button id="btn-create" class="flex-1 border border-retro py-3 hover:bg-retro hover:text-black transition-colors font-bold uppercase">
              [ CREATE ]
            </button>
            <button id="btn-join" class="flex-1 border border-retro/50 py-3 text-retro/70 hover:border-retro hover:text-retro hover:bg-retro/10 transition-colors font-bold uppercase">
              [ JOIN ]
            </button>
          </div>

        </div>
      </div>
    </div>
  `);
  this.addEvents();
  }

  addEvents() : void
  {
    const btnTournament = this.querySelector('#btn-tournament') as HTMLButtonElement;
    const modal = this.querySelector('#tournament-modal') as HTMLElement;
    const closeModal = this.querySelector('#close-modal') as HTMLButtonElement;
    const input = this.querySelector('#tournament-input') as HTMLInputElement;
    const btnCreate = this.querySelector('#btn-create') as HTMLButtonElement;
    const btnJoin = this.querySelector('#btn-join') as HTMLButtonElement;

    if (btnTournament && modal) {
      btnTournament.addEventListener('click', () => {
        modal.classList.remove('hidden');
        input.focus(); // Auto-focus input for better UX
      });
    }

    // 3. Close Modal Logic
    const hideModal = () => {
      modal.classList.add('hidden');
      input.value = ''; // Reset input
    };

    if (closeModal) closeModal.addEventListener('click', hideModal);
    
    // Close if clicking outside the box (optional but nice)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    // 4. Handle CREATE Action
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
          alert(">> ERROR: INPUT_EMPTY");
          return;
        }
        console.log(`Creating Tournament with Name: ${value}`);
        // TODO: Call your backend API to create
        // window.router.navigateTo(`/tournament/setup?name=${value}`);
        hideModal();
      });
    }

    // 5. Handle JOIN Action
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
          alert(">> ERROR: INPUT_EMPTY");
          return;
        }
        console.log(`Joining Tournament with Code: ${value}`);
        // TODO: Call your backend API to join
        hideModal();
      });
    }
  }
}

customElements.define('page-profile', ProfilePage);
