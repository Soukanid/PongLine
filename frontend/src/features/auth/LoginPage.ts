import { BaseComponent } from '../../core/Component';

export class LoginPage extends BaseComponent {
  render() {
    this.setHtml(`
      <div class="login-container">
        <h1>Login</h1>
        <button id="login-btn">Login with 42</button>
      </div>
    `);
  }

  addEvents() {
    this.querySelector('#login-btn')?.addEventListener('click', () => {
      console.log('Redirecting to 42 OAuth...');
    });
  }
}
customElements.define('page-login', LoginPage);
