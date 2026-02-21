import { BaseComponent } from "../../core/Component";
import tournIcon from "./../../../public/tourn.png";
import gameIcon from "./../../../public/game.png";
import { profileService } from "./ProfileService";
import { Tournament } from "./../types";
import { router } from "../../core/Router";

export class ProfilePage extends BaseComponent {

async render() {
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
           </div>
           
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
            <span class="animate-pulse">●</span> Active_Tournament
          </h3>
          <div id="tournament-list" class="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"></div>
        </div>


        <div id="tournament-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div class="border-2 border-retro p-8 w-100 relative bg-black">
            <button id="close-modal" class="absolute top-2 cursor-pointer right-4 text-retro/50 hover:text-retro text-xl font-bold">[X]</button>
            <h2 id="modal-title" class="text-xl font-bold font-mono mb-6 text-center animate-pulse">> ACCESS_TOURNAMENT</h2>
            <div id="modal-error" class="hidden border border-retro text-retro text-xs p-2 mb-4 text-center"></div>
            <div id="modal-form-view">
              <div class="mb-6">
                <input id="tournament-input" type="text" autocomplete="off"
                  class="w-full bg-transparent border-b border-retro py-2 text-center text-lg focus:outline-none placeholder-retro/30"
                  placeholder="ENTER NAME OR CODE">
                <p class="text-[10px] text-retro/40 mt-2 text-center italic">* Use a Name to Create, or a Code to Join *</p>
              </div>
              <div class="flex gap-4">
                <button id="btn-create" class="cursor-pointer flex-1 border border-retro py-3 hover:bg-retro hover:text-black transition-colors font-bold uppercase">
                  [ CREATE ]
                </button>
                <button id="btn-join" class="cursor-pointer flex-1 border border-retro/50 py-3 text-retro/70 hover:border-retro hover:text-retro hover:bg-retro/10 transition-colors font-bold uppercase">
                  [ JOIN ]
                </button>
              </div>
            </div>
            <div id="modal-tournament-view" class="hidden flex-col items-center">
              <p class="text-[10px] mb-2">Share this code with your friends:</p>
              <div id="share-code-display" class="bg-retro/20 border border-retro p-4 text-2xl tracking-widest font-bold mb-6 select-all">
                </div>
              <button id="btn-copy-code" class="w-full border cursor-pointer border-retro py-2 hover:bg-retro hover:text-black transition-colors font-bold text-xs">
                [ COPY CODE ]
              </button>
        </div>
      </div>
    </div>
  `);
  await this.loadTournaments();
  }



  // -------------------------------tournament LOGIC--------------------------------------

  async loadTournaments()
  {
    const myTourn = await profileService.getMyTournament();

    if (myTourn)
    {
        this.switchView(myTourn);
        return;
    }

    const list = await profileService.getActiveTournaments();

    if (list)
        this.renderTournamentList(list);
  }

  renderTournamentList(tourn: Tournament[])
  {
    const container = this.querySelector('#tournament-list');
    if (!container)
      return ;
    
    container.innerHTML = '';

    if (tourn.length === 0)
    {
      container.innerHTML = 
        `<div class="text-retro/30 text-center mt-4 border border-retro/10 p-2">
          NO ACTIVE TOURNAMENTS
        </div>`;
      return ;
    }

    tourn.forEach(t => this.addTrournToUI(t));

  }
  
  addTrournToUI(t: Tournament)
  {
    const container = this.querySelector('#tournament-list');
    if (!container)
      return ;

    const item = document.createElement('div');

    item.className = "flex justify-between items-center border border-retro/20 p-3 hover:bg-retro/10 cursor-pointer transition-colors group"

    item.innerHTML = `
      <div class="flex-1 flex-col w-full ">
        <span class="font-bold tracking-wider">${t.tour_name}</span>
      </div>
      <button class="join-btn cursor-pointer text-retro font-bold ml-auto hover:scale-110" data-id="${t.id}">
        < JOIN >
      </button>
    `
    const joingBtn = item.querySelector('.join-btn') as HTMLButtonElement;
    joingBtn?.addEventListener('click', (e) =>{
    e.stopPropagation();
      this.handleJoinTournament(t.tour_id, joingBtn);
    });

    container.appendChild(item);
  }

  async handleJoinTournament(tour_id : string, btn: HTMLButtonElement)
  {
    try {
      const updatedTourn = await profileService.joinTourn(tour_id);

      if (updatedTourn)
        this.switchView(updatedTourn);

    } catch(error: any)
    {
      const modal = this.querySelector('#tournament-modal') as HTMLElement;
      if (modal)
      {
        modal.classList.remove('hidden');
        
        this.querySelector('#modal-form-view')?.classList.remove('hidden');
        this.querySelector('#modal-tournament-view')?.classList.add('hidden');
      }
      this.showModalError(error.message || "Failed to join tournament.");
    } finally {
      btn.disabled = false;
    }
  }

  showModalError(message: string)
  {
    const errorDiv = this.querySelector('#modal-error');
    if (errorDiv)
    {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }


  switchView(tourn: any)
  {
    const formView = this.querySelector('#modal-form-view');
    const tournamentView = this.querySelector('#modal-tournament-view');
    const title = this.querySelector('#modal-title');
    const codeDisplay = this.querySelector('#share-code-display');
    const errorDiv = this.querySelector('#modal-error');

    formView?.classList.add('hidden');
    tournamentView?.classList.remove('hidden');
    errorDiv?.classList.add('hidden');

    if (title)
      title.textContent = "> TOURNAMENT CODE";

    if (codeDisplay)
      codeDisplay.textContent = tourn.tour_id;

    const btnTournament = this.querySelector('#btn-tournament') as HTMLButtonElement;
    if (btnTournament)
    {
      btnTournament.disabled = true;
      btnTournament.classList.add('opacity-50', 'cursor-not-allowed');
      btnTournament.innerHTML = `<span class="text-[10px] uppercase font-bold text-green-400">WAITING For Players...</span>`;
    }
    const listContainer = this.querySelector('#tournament-list');

    if (listContainer)
    {
      const playerCount = tourn.participant?.length || 1; 
      
      listContainer.innerHTML = `
        <div class="border border-retro/50 p-4 bg-retro/10 flex flex-col items-center text-center animate-pulse">
          <h4 class="text-retro font-bold uppercase tracking-widest mb-2">${tourn.tour_name}</h4>
          <p class="text-xs text-retro/70 mb-4">Status: ${tourn.tour_state}</p>
          <div class="flex gap-2">
            <span class="text-xl font-bold">${playerCount}</span>
            <span class="text-xl text-retro/50">/ 4</span>
          </div>
          <p class="text-[10px] text-retro/50 mt-2 uppercase">Players Joined</p>
        </div>
      `;
    }
  }

  //--------------------------------------------------------------------------------------------------
  addEvents() : void
  {
    const btnTournament = this.querySelector('#btn-tournament') as HTMLButtonElement;
    const modal = this.querySelector('#tournament-modal') as HTMLElement;
    const closeModal = this.querySelector('#close-modal') as HTMLButtonElement;
    const input = this.querySelector('#tournament-input') as HTMLInputElement;
    const btnCreate = this.querySelector('#btn-create') as HTMLButtonElement;
    const btnJoin = this.querySelector('#btn-join') as HTMLButtonElement;
    const btnPiPo = this.querySelector('#btn-pingpong') as HTMLButtonElement;
    const btnCopy = this.querySelector('#btn-copy-code') as HTMLButtonElement;
    const errorDiv = this.querySelector('#modal-error');

    if (btnTournament && modal) {
      btnTournament.addEventListener('click', () => {
        modal.classList.remove('hidden');
        input.focus();
      });
    }

    const hideModal = () => {
      modal.classList.add('hidden');
      input.value = '';
    };

    if (closeModal) closeModal.addEventListener('click', hideModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal)
        hideModal();
    });

    if (btnCreate)
    {
      btnCreate.onclick = async () => {
        const value = input.value.trim();
        if (!value) return;

        btnCreate.disabled = true;
        btnCreate.innerText = "CREATING...";
        if (errorDiv) errorDiv.classList.add('hidden');

        try {
          const tourn = await profileService.createTourn(value);
          if (tourn) {
             this.switchView(tourn); 
          }
        } catch (error: any) {
          this.showModalError(error.message || "Failed to create tournament.");
        } finally {
          btnCreate.disabled = false;
          btnCreate.innerText = "[ CREATE ]";
        }
      };
    }

    if (btnJoin)
    {
      btnJoin.onclick = async () => {
        const value = input.value.trim();
        if (!value) return;

        btnJoin.disabled = true;
        btnJoin.innerText = "JOINING...";
        if (errorDiv) errorDiv.classList.add('hidden');

        try {
          const updatedTourn = await profileService.joinTourn(value);
          if (updatedTourn) {
            this.switchView(updatedTourn);
          }
        } catch (error: any) {
          this.showModalError(error.message || "Failed to join tournament.");
        } finally {
          btnJoin.disabled = false;
          btnJoin.innerText = "[ JOIN ]";
        }
      };
    }

    if (btnCopy)
    {
      btnCopy.onclick = () => {
        const codeText = this.querySelector('#share-code-display')?.textContent;
        if (codeText) {
          navigator.clipboard.writeText(codeText.trim());
          btnCopy.innerText = "[ COPIED! ]";
          setTimeout(() => btnCopy.innerText = "[ COPY CODE ]", 2000);
        }
      };
    }

    if (btnPiPo)
    {
      btnPiPo.addEventListener('click', () => {
        router.navigate("/menu"); 
      });
    }
  }
}

customElements.define('profile-page', ProfilePage);

