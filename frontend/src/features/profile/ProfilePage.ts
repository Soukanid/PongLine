import { BaseComponent } from "../../core/Component";
import tournIcon from "./../../../public/tourn.png";
import gameIcon from "./../../../public/game.png";
import { profileService } from "./ProfileService";
import { Tournament } from "./../types";
import { router } from "../../core/Router";
import { chatService } from "../chat/ChatServices";

export class ProfilePage extends BaseComponent {

render() {
    this.setHtml(`
      <div class="h-screen text-retro font-mono p-6 flex gap-6 select-none overflow-hidden">
        
        <div class="flex-1 flex flex-col gap-6 h-full pb-30">
          
          <div class="border-2 border-retro/70 p-4 pt-6 flex flex-col relative shrink-0 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
  
            <div class="absolute top-0 left-0 w-full bg-retro/70 text-black text-[10px] px-2 font-bold flex justify-between">
              <span>root@pong:~/users/profile.exe</span>
              <span>[X]</span>
            </div>
            
            <div class="flex items-center  mt-2">
               <div class="shrink-0 relative group">
               <img id="avatar" class="h-30 w-30 rounded-full border-2 border-retro object-cover brightness-75">
            </div>
  
            <div class="flex-1 flex min-w-0 flex-col justify-center space-y-2 pl-10">
              <h2 id="profile-name" class="text-xl font-bold tracking-widest truncate mb-2">
                <span class="animate-pulse">_</span>
              </h2>
    
              <p id="profile-total" class="text-retro/80">$ total_matches : 0</p>
                <p id="profile-wins" class="text-retro/80">$ total_wins : 0</p>
              <p id="profile-losses" class="text-retro/80">$ total_losses : 0</p>
            </div>
            </div>

            <div id="guest-controls" class="hidden mt-6 pt-4 border-t border-dashed border-retro/50 flex flex-row gap-4 w-full">
            </div>
          </div>

          <div class="flex-1 border border-retro/50 rounded-sm p-4 relative flex flex-col min-h-0 ">
            <h3 class="text-xs text-retro/70 uppercase mb-3 flex items-center gap-2 shrink-0">
              <span class="animate-pulse">_</span> > MATCH_HISTORY.log
            </h3>
          <div id="match-history-list" class="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
          <div class="border-2 border-retro p-8 w-100 relative">
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
  }


  async connectedCallback()
  {
    super.connectedCallback();
    
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    let targetUsername = "ME";

    
    if (path.startsWith('/profile'))
    {
      const tmp  = urlParams.get('username'); 
      if (tmp)
        targetUsername = tmp;
    }

    await this.loadProfileData(targetUsername);
    await this.loadTournaments();
  }

  // -------------------------------Profile LOGIC--------------------------------------

  async loadProfileData(username: string)
  {
    const profileData = await profileService.getProfile(username);

    if (!profileData)
    {
       router.navigate("/dashboard");
       return;
    }
    this.setupGuestControls(profileData, username);

    const stats = await profileService.getStats(profileData.username);

    const nameEl = this.querySelector('#profile-name');
    const winsEl = this.querySelector('#profile-wins');
    const lossesEl = this.querySelector('#profile-losses');
    const totalEl = this.querySelector('#profile-total');
    const avatarEl = this.querySelector('#avatar') as HTMLImageElement;
    
    if (nameEl)
      nameEl.textContent = `> ${profileData.username}`;
    
    if (avatarEl && profileData.avatar)
      avatarEl.src = profileData.avatar;

    if (totalEl)
      totalEl.textContent = `$ total_matches : ${stats?.total_games || 0}`;
    
    if (winsEl)
      winsEl.textContent = `$ total_wins : ${stats?.total_wins || 0}`;
    
    if (lossesEl)
      lossesEl.textContent = `$ total_losses : ${stats?.total_losses || 0}`;

    const history = await profileService.getMatchHistory(profileData.username);
    this.renderMatchHistory(history, profileData.username);
  }

  renderMatchHistory(matches: any[], currentUsername: string)
  {
    const container = this.querySelector('#match-history-list');
    if (!container)
      return;

    container.innerHTML = '';

    if (!matches || matches.length === 0)
    {
      container.innerHTML = `
        <div class="text-retro/30 text-center text-[10px] mt-4 border border-dashed border-retro/20 p-2">
          NO MATCH DATA FOUND
        </div>`;
      return;
    }

    matches.forEach(match => {
      const isPlayer1 = match.username1 === currentUsername;
      const opponent = isPlayer1 ? match.username2 : match.username1;
      const myScore = isPlayer1 ? match.score_plr1 : match.score_plr2;
      const oppScore = isPlayer1 ? match.score_plr2 : match.score_plr1;
      
      const isWin = match.winnerName === currentUsername;
      const statusText = isWin ? 'VICTORY' : 'DEFEAT';
      const scoreDisplay = `${myScore} - ${oppScore}`;

      const item = document.createElement('div');
      item.className = "flex justify-between items-center border border-retro/20 p-2 bg-retro/5 text-[10px] hover:bg-retro/10 transition-colors";
      
      item.innerHTML = `
        <div class="flex flex-col">
          <span class="text-retro/50 uppercase">vs ${opponent || 'Unknown'}</span>
          <span class="font-bold tracking-wider">${new Date(match.playedAt).toLocaleDateString()}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="font-retro font-bold">${statusText}</span>
          <span class="text-retro font-bold">${scoreDisplay}</span>
        </div>
      `;
      
      container.appendChild(item);
    });
  }

  setupGuestControls(profileData: any, targetUsername: string)
  {
    const guestControls = this.querySelector('#guest-controls');
    if (!guestControls)
      return;

    guestControls.innerHTML = '';

    if (targetUsername === "ME" || profileData.relationship === 'me' || profileData.relationship === 'blocked_by_other')
    {
      guestControls.classList.add('hidden');
      return;
    }

    guestControls.classList.remove('hidden');

    if (profileData.relationship === 'blocked_by_me')
    {
      guestControls.innerHTML = `
        <button id="btn-block" class="flex-1 border border-retro py-2 text-[10px] uppercase font-bold hover:bg-retro hover:text-black transition-colors cursor-pointer text-retro">
          [ UNBLOCK.exe ]
        </button>
      `;
      const btnBlock = this.querySelector('#btn-block') as HTMLButtonElement;
      btnBlock.onclick = () => this.handleUserAction('blocks/remove', profileData.username);
      return;
    }

    let friendBtnText = '';
    let friendRoute = '';

    switch (profileData.relationship)
    {
      case 'friend':
        friendBtnText = '[ UNFRIEND.sh ]';
        friendRoute = 'friends/remove';
        break;
      case 'sent':
        friendBtnText = '[ CANCEL_REQ.sh ]';
        friendRoute = 'friends/remove';
        break;
      case 'received':
        friendBtnText = '[ ACCEPT_REQ.sh ]';
        friendRoute = 'friends/accept';
        break;
      default:
        friendBtnText = '[ ADD_FRIEND.sh ]';
        friendRoute = 'friends/request';
        break;
    }

    guestControls.innerHTML = `
      <button id="btn-add-friend" class="flex-1 border border-retro/50 py-2 text-[10px] uppercase font-bold hover:bg-retro hover:text-black transition-colors cursor-pointer">
        ${friendBtnText}
      </button>
      <button id="btn-message" class="flex-1 border border-retro/50 py-2 text-[10px] uppercase font-bold hover:bg-retro hover:text-black transition-colors cursor-pointer">
        [ MSG_USER.exe ]
      </button>
      <button id="btn-block" class="flex-1 border border-retro/50 py-2 text-[10px] uppercase font-bold hover:bg-retro hover:text-black transition-colors cursor-pointer text-red-500">
        [ BLOCK_USER.exe ]
      </button>
    `;

    const btnAdd = this.querySelector('#btn-add-friend') as HTMLButtonElement;
    const btnMsg = this.querySelector('#btn-message') as HTMLButtonElement;
    const btnBlock = this.querySelector('#btn-block') as HTMLButtonElement;

    btnAdd.onclick = () => this.handleUserAction(friendRoute, profileData.username);
    btnMsg.onclick = () => router.navigate(`/chat?user=${profileData.username}`);
    btnBlock.onclick = () => this.handleUserAction('blocks/add', profileData.username);
  }

  private async handleUserAction(route: string, username: string) {
    const success = await profileService.executeUserAction(route, username);
    if (success) {
      await this.loadProfileData(username);
    }
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

