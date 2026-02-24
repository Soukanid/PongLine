import { BaseComponent } from '../../core/Component';
import { settingService } from './SettingService'

export class SettingsPage extends BaseComponent {
  
  async render() {
    this.setHtml(`
      <div class="h-screen  overflow-hidden p-4 bg-black font-mono text-retro selection:bg-retro selection:text-black">
        
        <div class="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-7 flex flex-col gap-8">
              
              <div class="relative border border-retro/40 bg-retro/5 p-6 md:p-8 rounded-sm">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-retro/70 tracking-widest">[ IDENTITY_MODULE ]</div>
                
                <div class="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-8 pb-8 border-b border-retro/20">
                  <div class="relative w-28 h-28 border border-retro flex items-center justify-center shrink-0 group cursor-pointer hover:bg-retro/10 transition-all shadow-[0_0_10px_rgba(0,255,0,0.1)]">
                    <span class="text-retro/40 text-xs">NO_IMAGE</span>
                    <div class="absolute -bottom-3 bg-black px-2 text-[10px] text-retro group-hover:text-white transition-colors">
                      [ UPLOAD ]
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 text-sm text-retro/60">
                    <p>STATUS: <span class="text-retro animate-pulse">ONLINE</span></p>
                    <p>ACCESS: <span class="text-retro">STANDARD_USER</span></p>
                  </div>
                </div>

                <div class="flex flex-col gap-5">
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> USERNAME :</label>
                    <input id="username-input" type="text" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all placeholder-retro/30" placeholder="Enter new alias...">
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> EMAIL :</label>
                    <input id="email-input" type="email" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all placeholder-retro/30" placeholder="user@system.com">
                  </div>
                  
                  <div class="flex justify-end mt-2">
                    <button id="change-profile-btn" class="bg-retro text-black font-bold py-2 px-6 hover:bg-white transition-colors cursor-pointer text-sm tracking-wider uppercase">
                      [ Update_Profile ]
                    </button>
                  </div>
                </div>
              </div>

              <div class="relative border border-retro/40 bg-retro/5 p-6 md:p-8 rounded-sm">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-retro/70 tracking-widest">[ SECURITY_CREDENTIALS ]</div>
                
                <div class="flex flex-col gap-5">
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> CURRENT_PW :</label>
                    <input id="current-pw-input" type="password" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all" placeholder="••••••••">
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> NEW_PW :</label>
                    <input id="new-pw-input" type="password" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all" placeholder="••••••••">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> REPEAT_PW :</label>
                    <input id="repeat-pw-input" type="password" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all" placeholder="••••••••">
                  </div>
                  
                  <div class="flex justify-end mt-2">
                    <button id="change-password-btn" class="bg-retro border border-retro text-black font-bold py-2 px-6 hover:bg-black hover:text-retro transition-colors cursor-pointer text-sm tracking-wider uppercase">
                      [ Change_Password ]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-5 flex flex-col gap-8">
              
              <div class="relative border border-retro/40 bg-retro/5 p-6 md:p-8 rounded-sm flex-1">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-retro/70 tracking-widest">[ TWO_FACTOR_AUTH ]</div>
                
                <div class="flex flex-col gap-6 items-center w-full">
                  
                  <button id="toggle-2fa-btn" class="w-full bg-transparent border-2 border-retro text-retro font-bold py-3 px-4 hover:bg-retro hover:text-black transition-colors cursor-pointer tracking-wider uppercase">
                    [ ENABLE_2FA.sh ]
                  </button>

                  <div class="w-full h-[1px] bg-retro/20 my-2"></div>

                  <div class="text-center w-full">
                    <p class="text-sm text-retro/80 mb-4">> SCAN_QR_CODE :</p>
                    <div class="mx-auto bg-retro/90 rounded-sm w-48 h-48 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.15)] mb-6">
                      <div class="w-40 h-40 border-2 border-black border-dashed flex items-center justify-center">
                        <span class="text-black font-bold opacity-60 text-xs">AWAITING_KEY...</span>
                      </div>
                    </div>
                  </div>

                  <div class="w-full flex flex-col gap-3">
                    <label class="text-retro/80 text-sm">> VERIFICATION_CODE :</label>
                    <div class="flex gap-2">
                      <input id="verification-code-input" type="text" class="flex-1 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro text-center tracking-[0.5em] text-lg placeholder-retro/20" placeholder="000000" maxlength="6">
                      <button id="verify-code-btn" class="bg-retro text-black font-bold px-4 hover:bg-white transition-colors cursor-pointer text-sm">
                        VERIFY
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <div class="relative border border-red-900/60 bg-red-950/20 p-6 md:p-8 rounded-sm mt-auto">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-red-500 tracking-widest animate-pulse">[ SYSTEM_OVERRIDE ]</div>
                
                <div class="flex flex-col gap-4 items-center text-center">
                  <p class="text-red-500/80 text-xs tracking-wider">WARNING: THIS ACTION IS IRREVERSIBLE AND WILL PURGE ALL USER DATA FROM THE MAINFRAME.</p>
                  
                  <button id="delete-account-btn" class="w-full bg-red-900/20 border border-red-600 text-red-500 font-bold py-3 px-4 hover:bg-red-600 hover:text-black transition-all cursor-pointer tracking-widest uppercase shadow-[0_0_10px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] mt-2">
                    [ PURGE_ACCOUNT.exe ]
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `);
  }

  addEvents() {
    // Selectors for Profile
    const changeProfileBtn = this.querySelector('#change-profile-btn');
    const usernameInput = this.querySelector('#username-input') as HTMLInputElement;
    const emailInput = this.querySelector('#email-input') as HTMLInputElement;

    changeProfileBtn?.addEventListener('click', async () => {
      const newUsername = usernameInput.value.trim();
      
      if (!newUsername)
        return;

      const userRes = settingService.changeUsernameOnUserService(newUsername) as any;
      
      if (userRes.success === true)
      {
        //[soukaina] alert for now but it should be checked
        alert("> ERROR: " + userRes.message);
        return;
      }
      
      const authRes = settingService.changeUsernameOnAuthService(newUsername) as any;

      if (!authRes.success)
      {
        //[soukaina] alert for now but it should be checked
        alert("> ERROR: " + userRes.message);
        return;
      }

    });

    const changePasswordBtn = this.querySelector('#change-password-btn');
    const currentPwInput = this.querySelector('#current-pw-input') as HTMLInputElement;
    const newPwInput = this.querySelector('#new-pw-input') as HTMLInputElement;
    const repeatPwInput = this.querySelector('#repeat-pw-input') as HTMLInputElement;

    changePasswordBtn?.addEventListener('click', async () => {
      const currentPw = currentPwInput.value;
      const newPw = newPwInput.value;
      const repeatPw = repeatPwInput.value;

      if (!currentPw || !newPw)
      {
        //[soukaina] should be changed
        alert("> ERROR: Please fill in all password fields.");
        return;
      }

      if (newPw !== repeatPw)
      {
        //[soukaina] should be changed
        alert("> ERROR: New passwords do not match!");
        return;
      }

      const res = await settingService.changePassword(currentPw, newPw);

      if (res.success === "true")
      {
        //[soukaina] should be changed
        alert("> SUCCESS: Password updated securely.");
        currentPwInput.value = '';
        newPwInput.value = '';
        repeatPwInput.value = '';
      }
      else
        //[soukaina] should be changed
        alert("> ERROR: " + res.message); 
    });


    const toggle2faBtn = this.querySelector('#toggle-2fa-btn');
    const verifyCodeBtn = this.querySelector('#verify-code-btn');
    const verifyInput = this.querySelector('#verification-code-input') as HTMLInputElement;

    toggle2faBtn?.addEventListener('click', () => {
      console.log('Toggle 2FA requested');
    });

    verifyCodeBtn?.addEventListener('click', () => {
      console.log('Verify code:', verifyInput.value);
    });

    const deleteAccountBtn = this.querySelector('#delete-account-btn');
    
    deleteAccountBtn?.addEventListener('click', () => {
      const confirmDelete = confirm("Are you sure you want to delete your account? This cannot be undone.");
      if (confirmDelete) {
        console.log('Delete account confirmed');
      }
    });
  }
}

customElements.define('settings-page', SettingsPage);

