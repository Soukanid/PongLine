import { BaseComponent } from '../../core/Component';

export class ChatPage extends BaseComponent {

  render() {
    this.setHtml(`
      <div class="chat-container">
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


