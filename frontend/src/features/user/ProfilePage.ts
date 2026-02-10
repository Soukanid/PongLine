import { BaseComponent } from '../../core/Component';

export class ProfilePage extends BaseComponent {
  
  async render() {
    // 1. GET THE ID FROM THE URL
    const queryString = window.location.search; // Returns "?id=5"
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get('id'); // Returns "5" or null

    // 2. CHECK IF WE ARE VIEWING A FRIEND OR OURSELVES
    if (userId) {
       console.log(`Viewing Friend's Profile (ID: ${userId})`);
       // await this.loadFriendProfile(userId);
    } else {
       console.log("Viewing My Profile");
       // await this.loadMyProfile();
    }

    // 3. RENDER THE HTML
    this.setHtml(`
      <div class="text-retro text-center mt-10">
         <h1>Profile Page</h1>
         <p>Viewing User ID: ${userId || 'ME'}</p>
      </div>
    `);
  }

  addEvents() {
     // ...
  }
}

customElements.define('page-profile', ProfilePage);
