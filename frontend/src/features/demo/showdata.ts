import { BaseComponent } from '../../core/Component';

export class DemoPage extends BaseComponent {
  
  render() {
    this.setHtml(`
      <style>
        .demo-container { 
            max-width: 500px; 
            margin: 50px auto; 
            padding: 2rem; 
            text-align: center; 
            background: #fff; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: sans-serif;
        }
        h2 { color: #333; }
        .btn-primary { 
            background: #007bff; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px;
        }
        .btn-primary:disabled { background: #ccc; }
        .user-list { 
            margin-top: 20px; 
            text-align: left; 
        }
        .user-item { 
            padding: 10px; 
            border-bottom: 1px solid #eee; 
            color: #555;
        }
      </style>

      <div class="demo-container">
        <h2>Backend Connection Demo</h2>
        <p>Click to fetch users from SQLite via API Gateway</p>
        
        <button id="fetch-btn" class="btn-primary">
          Fetch Users
        </button>

        <div id="results" class="user-list"></div>
      </div>
    `);
  }

  addEvents() {
    const btn = this.querySelector('#fetch-btn') as HTMLButtonElement;
    const resultsDiv = this.querySelector('#results') as HTMLElement;

    if (btn) {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Loading...';
        resultsDiv.innerHTML = '';

        try {
          const response = await fetch('/api/auth/users');
          
          if (!response.ok) throw new Error('Network error');
          
          const users = await response.json();

          if (users.length === 0) {
            resultsDiv.innerHTML = '<p>No users found.</p>';
          } else {
            resultsDiv.innerHTML = users.map((u: any) => `
              <div class="user-item">
                <strong>${u.username}</strong> <br>
                <small>${u.email}</small>
              </div>
            `).join('');
          }

        } catch (error) {
          resultsDiv.innerHTML = `<p style="color: red">❌ Error: Failed to connect to Backend.</p>`;
          console.error(error);
        } finally {
          btn.disabled = false;
          btn.textContent = 'Fetch Users';
        }
      });
    }
  }
}

customElements.define('page-demo', DemoPage);
