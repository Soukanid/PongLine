import { BaseComponent } from '../../core/Component';
import { router } from '../../main';
import "../../css/button.css";
import "../../css/game.css";
import "../../css/prompt.css";

export class Menu extends BaseComponent {
    render() {
        this.setHtml(`
  <div class="button-container">
  <button class="btn" data-mode="local">
    <pre class="ascii">
██╗       ██████╗   ██████   █████╗   ██╗      
██║      ██╔═══██╗ ██╔═══   ██╔══██╗  ██║      
██║      ██║   ██║ ██║      ███████║  ██║      
██║      ██║   ██║ ██║      ██╔══██║  ██║      
███████╗ ╚██████╔╝ ╚██████  ██║  ██║  ███████╗ 
╚══════╝  ╚═════╝   ╚═════╝ ╚═╝  ╚═╝  ╚══════╝ 
</pre><div class="btn-label">Game</div></button>
<button class="btn" data-mode="remote">
    <pre class="ascii">
██████╗  ███████╗███╗   ███╗ ██████╗ ████████╗███████╗
██╔══██╗ ██╔════╝████╗ ████║██╔═══██╗╚══██╔══╝██╔════╝
██████╔╝ █████╗  ██╔████╔██║██║   ██║   ██║   █████╗  
██╔══██╗ ██╔══╝  ██║╚██╔╝██║██║   ██║   ██║   ██╔══╝  
██║  ██║ ███████╗██║ ╚═╝ ██║╚██████╔╝   ██║   ███████╗
╚═╝  ╚═╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚══════╝
  </pre><div class="btn-label">Game</div></button>
  <button class="btn" data-mode="bot">
    <pre class="ascii">
██████╗   ██████╗  ████████╗
██╔══██╗ ██╔═══██╗ ╚══██╔══╝
██████╔╝ ██║   ██║    ██║   
██╔══██╗ ██║   ██║    ██║   
██████╔╝ ╚██████╔╝    ██║   
╚═════╝   ╚═════╝     ╚═╝  
  </pre><div class="btn-label">Game</div></button>
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

    addEvents(): void {
      const buttons = this.querySelectorAll<HTMLButtonElement>(".btn");
      buttons.forEach(btn => {
        btn.addEventListener("click", async () => {
          const mode = btn.dataset.mode;
          if (!mode) return;
          if (mode === "remote" || mode === "bot") {
            const nick = await this.showPrompt({
              title: 'Paddle master',
              message: 'What is your nickname? (optional)',
              placeholders: ['Your nickname']
            });
            if (nick === null) return;
            const q = 'mode=' + encodeURIComponent(mode) + (nick ? '&nick=' + encodeURIComponent(nick as string) : '');
            router.navigateTo(`/game?${q}`);
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
            router.navigateTo(`/game?${q}`);
          }

        });
      });
    }

}

customElements.define('page-menu', Menu);