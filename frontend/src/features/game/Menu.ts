import { BaseComponent } from '../../core/Component';
import { router } from '../../core/Router';
import "../../css/button.css";
import "../../css/game.css";
import "../../css/prompt.css";

export class Menu extends BaseComponent {
    render() {
      this.setHtml(`
        <div class="button-container">
          <button data-mode="local" class="btn group border border-[#1BFB08] p-3 cursor-pointer outline-none overflow-hidden leading-none">
            <img src="blackLocal.png" class="block group-hover:hidden w-full h-full object-cover">     
            <img src="greenLocal.png" class="hidden group-hover:block w-full h-full object-cover">
          </button>
          <button data-mode="remote" class="btn group border border-[#1BFB08] p-3 cursor-pointer outline-none overflow-hidden leading-none">
            <img src="blackRemote.png" class="block group-hover:hidden w-full h-full object-cover">     
            <img src="greenRemote.png" class="hidden group-hover:block w-full h-full object-cover">
          </button>
          <button data-mode="bot" class="btn group border border-[#1BFB08] p-3 cursor-pointer outline-none overflow-hidden leading-none">
            <img src="blackBot.png" class="block group-hover:hidden w-full h-full object-cover">     
            <img src="greenBot.png" class="hidden group-hover:block w-full h-full object-cover">
          </button>
        </div>
     `);
    }

    private showPrompt(opts: { title?: string; message?: string; placeholders: string[]; }): Promise<string | string[] | null> {
      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'pl-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'pl-dialog';

        if (opts.title) {
          const h = document.createElement('div');
          h.className = 'pl-title';
          h.textContent = opts.title;
          dialog.appendChild(h);
        }
        if (opts.message) {
          const m = document.createElement('div');
          m.className = 'pl-message';
          m.textContent = opts.message;
          dialog.appendChild(m);
        }

        const inputs: HTMLInputElement[] = [];
        opts.placeholders.forEach(ph => {
          const input = document.createElement('input');
          input.className = 'pl-input';
          input.placeholder = ph;
          input.maxLength = 8;
          dialog.appendChild(input);
          inputs.push(input);
        });

        const actions = document.createElement('div');
        actions.className = 'pl-actions';
        const cancel = document.createElement('button');
        cancel.className = 'pl-btn';
        cancel.textContent = 'Cancel';
        const ok = document.createElement('button');
        ok.className = 'pl-btn primary';
        ok.textContent = 'OK';
        actions.appendChild(cancel);
        actions.appendChild(ok);
        dialog.appendChild(actions);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        setTimeout(() => inputs[0]?.focus(), 0);

        const cleanup = (result: string | string[] | null) => {
          document.body.removeChild(overlay);
          resolve(result);
        };

        cancel.addEventListener('click', () => cleanup(null));
        ok.addEventListener('click', () => {
          if (inputs.length === 1) cleanup(inputs[0].value.trim() || '');
          else cleanup(inputs.map(i => i.value.trim() || ''));
        });

        overlay.addEventListener('click', e => {
          if (e.target === overlay) cleanup(null);
        });

        overlay.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Escape') cleanup(null);
          if (e.key === 'Enter') ok.click();
        });
      });
    }
    private showRoomIdDialog(roomId: string, resolve: (value: string) => void, cleanup: (result: string | string[] | null) => void): void {
      const overlay = document.body.querySelector('.pl-overlay') as HTMLElement;
      const dialog = overlay.querySelector('.pl-dialog') as HTMLElement;
      
      dialog.innerHTML = '';
      
      const title = document.createElement('div');
      title.className = 'pl-title';
      title.textContent = 'Room Created!';
      dialog.appendChild(title);
      
      const message = document.createElement('div');
      message.className = 'pl-message';
      message.textContent = 'Share this Room ID with your friend:';
      dialog.appendChild(message);
      
      const roomIdContainer = document.createElement('div');
      roomIdContainer.className = 'pl-room-id-container';
      
      const roomIdDisplay = document.createElement('div');
      roomIdDisplay.className = 'pl-room-id-display';
      roomIdDisplay.textContent = roomId;
      roomIdDisplay.style.cursor = 'pointer';
      roomIdDisplay.style.userSelect = 'all';
      roomIdDisplay.title = 'Click to copy';
      roomIdContainer.appendChild(roomIdDisplay);
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'pl-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(roomId).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        });
      });
      roomIdContainer.appendChild(copyBtn);
      dialog.appendChild(roomIdContainer);
      
      const actions = document.createElement('div');
      actions.className = 'pl-actions';
      
      const continueBtn = document.createElement('button');
      continueBtn.className = 'pl-btn primary';
      continueBtn.textContent = 'Continue';
      continueBtn.addEventListener('click', () => {
        cleanup(roomId);
      });
      
      actions.appendChild(continueBtn);
      dialog.appendChild(actions);
    }
    private remotePrompt(opts: { title?: string; message?: string; placeholders: string[]; }): Promise<string | string[] | null> {
      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'pl-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'pl-dialog';

        if (opts.title) {
          const h = document.createElement('div');
          h.className = 'pl-title';
          h.textContent = opts.title;
          dialog.appendChild(h);
        }
        if (opts.message) {
          const m = document.createElement('div');
          m.className = 'pl-message';
          m.textContent = opts.message;
          dialog.appendChild(m);
        }

        const inputs: HTMLInputElement[] = [];
        opts.placeholders.forEach(ph => {
          const input = document.createElement('input');
          input.className = 'pl-input';
          input.placeholder = ph;
          dialog.appendChild(input);
          inputs.push(input);
        });
        const actions = document.createElement('div');
        actions.className = 'pl-actions';
        const createRoom = document.createElement('button');
        createRoom.className = 'pl-btn';
        createRoom.textContent = 'Create Room';
        const Join = document.createElement('button');
        Join.className = 'pl-btn primary';
        Join.textContent = 'Join';
        actions.appendChild(createRoom);
        actions.appendChild(Join);
        dialog.appendChild(actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        setTimeout(() => inputs[0]?.focus(), 0);
        createRoom.addEventListener('click', async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/create-room`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({})
            });
          
            const res = await response.json();
          
            if (res.success && res.roomId) {
              this.showRoomIdDialog(res.roomId, resolve, cleanup);
            } else {
              console.log('Server failed to create room.');
            }
          } catch (err) {
            console.error(err);
          }
        });
        Join.addEventListener('click', () => {
          const values = inputs.map(i => i.value.trim());
          const allFilled = values.every(val => val.length > 0);
          if (!allFilled) {
            inputs.forEach(i => {
              if (!i.value.trim()) i.style.border = '1px solid #1BFB08';
              else i.style.border = '';
            });
            return;
          }
          if (inputs.length === 1) cleanup(values[0]);
          else cleanup(values);
        });

        const cleanup = (result: string | string[] | null) => {
          document.body.removeChild(overlay);
          resolve(result);
        };

        overlay.addEventListener('click', e => {
          if (e.target === overlay) cleanup(null);
        });
        overlay.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Escape') cleanup(null);
          if (e.key === 'Enter') Join.click();
        });
      });
    }
    addEvents(): void {
      const buttons = this.querySelectorAll<HTMLButtonElement>(".btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", async () => {
          const mode = btn.dataset.mode;
          if (!mode) return;
          if (mode === "bot") {
            const nick = await this.showPrompt({
              title: 'Paddle master',
              message: 'What is your nickname? (optional)',
              placeholders: ['Your nickname']
            });
            if (nick === null) return;
            const q = 'mode=' + encodeURIComponent(mode) + (nick ? '&nick=' + encodeURIComponent(nick as string) : '');
            router.navigate(`/game?${q}`);
          }
          if (mode === "remote") {
            const room = await this.remotePrompt({
              title: 'Paddle master',
              message: 'Enter room ID to join a new room',
              placeholders: ['Room ID']
            });
            if (room === null) return;
            const q = 'mode=' + encodeURIComponent(mode) + '&room=' + encodeURIComponent(room as string);
            router.navigate(`/game?${q}`);
          }

          if (mode === "local") {
            const res = await this.showPrompt({
              title: 'Paddle masters',
              message: 'Enter nicknames for both players (optional)',
              placeholders: ['Player 1 nickname', 'Player 2 nickname']
            });
            if (res === null) return;
            const left = res?.[0] || '';
            const right = res?.[1] || '';
            const q = 'mode=' + encodeURIComponent(mode) + (left ? '&left=' + encodeURIComponent(left) : '') + (right ? '&right=' + encodeURIComponent(right) : '');
            router.navigate(`/game?${q}`);
          }

        });
      });
    }

}

customElements.define('menu-page', Menu);
