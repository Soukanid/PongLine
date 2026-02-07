import { BaseComponent } from '../../core/Component';
import { chatService } from './ChatServices';

export class ChatPage extends BaseComponent {

  render() {
    this.setHtml(`
    <div id="grandparent" class="h-full w-full   flex flex-col">
      <header class="h-16 flex items-center justify-between px-4">
        Pongline 
      </header>

      <div class="flex-1 flex overflow-hidden ">
      
        <div class="w-3/4 flex flex-col border border-retro/50 rounded-xl">

          <div class="h-12 flex  border-b border-retro/50">
                Who am I
          </div>
          <div class="flex-1 flex ">
              Message Area
          </div>
          <div class="h-15 flex border-t border-retro/50">
            Input/Send Box
          </div>

        </div>
        <div class="w-1/4 flex border border-retro/50 rounded-xl flex-col ml-4">
          <div class="h-12 flex  text-white border-b border-retro/50">
                fs
          </div>
          <div class=" flex-1 flex  text-white">
                Who am I
          </div>
        </div>
      </div>

    `);
  
  }
  addEvents() {
    const btn = this.querySelector('#send-btn');
    const input = this.querySelector('#msg-input') as HTMLInputElement;

    btn?.addEventListener('click', () => {
      if (input?.value) {
        console.log(`Sending: ${input.value}`);
        input.value = '';
      }
    });
  }
}

customElements.define('page-chat', ChatPage);


