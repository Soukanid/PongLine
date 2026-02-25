import { BaseComponent } from '../../core/Component';
import { settingService } from './SettingService'
import { appStore } from './../../core/Store'

export class SettingsPage extends BaseComponent {
  
  async render() {

    const user = appStore.getUser();
    const avatarHTML = user?.avatar 
      ? `<img src="${user.avatar}" class="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all">`
      : `<span class="text-retro/40 text-xs">NO_IMAGE</span>`;
    
    this.setHtml(`
      <div class="size-full  overflow-hidden px-4 pb-4 bg-black font-mono text-retro selection:bg-retro selection:text-black">
        
        <div class="size-full mx-auto flex flex-col gap-8">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-7 flex flex-col gap-6">
              
              <div class="relative border border-retro/40 bg-retro/5 p-4 mt-4 rounded-sm">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-retro/70 tracking-widest">[ IDENTITY_MODULE ]</div>
                
                <div class="flex flex-col sm:flex-row gap-8 items-start sm:items-center mb-6 pb-8 border-b border-retro/20">
                  
                  <div class="flex flex-col items-center">
                    <div id="avatar-container" class="relative w-28 h-28 border border-retro flex items-center justify-center shrink-0 group cursor-pointer hover:bg-retro/10 transition-all shadow-[0_0_10px_rgba(0,255,0,0.1)] mb-6">

                        ${avatarHTML}

                      <div class="absolute -bottom-6  px-2 text-[10px] text-retro transition-colors">
                        [ UPLOAD ]
                      </div>
                    </div>
                    <span class="text-retro/50 text-[10px]">> FORMAT: PNG | MAX: 1MB</span>
                    <span id="avatar-error" class="text-red-500 text-[10px] hidden font-bold mt-1 text-center"></span>
                  </div>

                  <div class="flex flex-col gap-1 text-sm text-retro/60">
                    <p>STATUS: <span class="text-retro animate-pulse">ONLINE</span></p>
                    <p>ACCESS: <span class="text-retro">STANDARD_USER</span></p>
                  </div>
                </div>

                <div class="flex flex-col gap-5">
                  <div class="flex flex-row gap-8" >
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> USERNAME :</label>
                    <input id="username-input" type="text" class="md:col-span-2 bg-black border border-retro/50 px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all placeholder-retro/30" placeholder="Enter new alias...">
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-4">
                    <label class="text-retro/80 text-sm">> EMAIL :</label>
                    <input disabled id="email-input" type="email" class="md:col-span-2 bg-black border border-retro/50  px-3 py-2 text-retro focus:outline-none focus:border-retro focus:ring-1 focus:ring-retro transition-all placeholder-retro/30" placeholder="user@system.com">
                  </div>
                  </div>
                  <span id="profile-msg" class="text-[10px] font-bold mb-2 text-left mr-auto min-h-[15px]"></span>
                  <div class="flex justify-end pr-4">
                    <button id="change-profile-btn" class="bg-retro text-black font-bold py-2 px-6 border border-retro/50 transition-colors cursor-pointer text-sm tracking-wider uppercase">
                      [ Update_Profile ]
                    </button>
                  </div>
                </div>
              </div>

              <div class="relative border border-retro/40 bg-retro/5 p-4 rounded-sm">
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
                  
                  <div class="flex justify-end pr-4">
                    <span id="password-msg" class="text-[10px] font-bold mb-2 text-right min-h-[15px]"></span>
                    <button id="change-password-btn" class="bg-retro border border-retro text-black font-bold py-2 px-6 hover:bg-black hover:text-retro transition-colors cursor-pointer text-sm tracking-wider uppercase">
                      [ Change_Password ]
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-5 flex flex-col gap-6">
              
              <div class="relative border border-retro/40 bg-retro/5 p-4 mt-4 rounded-sm flex-1">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-retro/70 tracking-widest">[ TWO_FACTOR_AUTH ]</div>
                
                <div class="flex flex-col gap-2 items-center w-full">
                  
                  <button id="toggle-2fa-btn" class="w-full bg-transparent border-2 border-retro text-retro font-bold py-3 px-4 hover:bg-retro hover:text-black transition-colors cursor-pointer tracking-wider uppercase">
                    [ ENABLE_2FA.sh ]
                  </button>

                  <div class="w-full h-[1px] bg-retro/20 my-1"></div>

                  <div class="text-center w-full">
                    <p class="text-sm text-retro/80 mb-4">> SCAN_QR_CODE :</p>
                    <div class="mx-auto bg-black/90 rounded-sm w-48 h-48 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.15)] mb-6">
                      <div class="w-40 h-40 border-2 border-retro border-dashed flex items-center justify-center">
                        <span class="text-retro font-bold opacity-60 text-xs">AWAITING_KEY...</span>
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

              <div class="relative border border-red-900/60 bg-red-950/20 p-4 rounded-sm mt-auto">
                <div class="absolute -top-3 left-4 bg-black px-2 text-xs text-red-500 tracking-widest animate-pulse">[ SYSTEM_OVERRIDE ]</div>
                
                <div class="flex flex-col gap-4 items-center text-center">
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

    const showMessage = (id: string, msg: string, isError: boolean = false) => {
      const el = this.querySelector(`#${id}`);
      if (!el) return;
      
      el.textContent = msg;
      el.className = `text-[10px] font-bold min-h-[15px] transition-all duration-300 ${isError ? 'text-red-500' : 'text-green-500'}`;
      
      setTimeout(() => {
        if (el.textContent === msg) el.textContent = '';
      }, 3000);
    };
    const changeProfileBtn = this.querySelector('#change-profile-btn');
    const usernameInput = this.querySelector('#username-input') as HTMLInputElement;
    const emailInput = this.querySelector('#email-input') as HTMLInputElement;
    const avatarContainer = this.querySelector('#avatar-container');
    const avatarError = this.querySelector('#avatar-error'); // 👈 Get the error span
    const user = appStore.getUser();

    if (user)
    {
      if (usernameInput)
        usernameInput.value = user.username || '';
      if (emailInput)
        emailInput.value = user.email || '';
    }

    // change the avatar
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png';
    fileInput.style.display = 'none';
    this.appendChild(fileInput);

    avatarContainer?.addEventListener('click', () => {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;

      // Reset error message on new selection
      if (avatarError) {
        avatarError.textContent = '';
        avatarError.classList.add('hidden');
      }

      if (!target.files || target.files.length === 0)
        return ;

      const file = target.files[0];

      if (file.size > 1024 * 1024)
      {
        if (avatarError) {
          avatarError.textContent = '> ERROR: MAX SIZE 1MB EXCEEDED';
          avatarError.classList.remove('hidden');
        }
        target.value = '';
        return ;
      }
      
      if (file.type !== 'image/png') {
        if (avatarError) {
          avatarError.textContent = '> ERROR: FILE MUST BE PNG';
          avatarError.classList.remove('hidden');
        }
        target.value = '';
        return ;
      }
        
      // create a reader object
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;

        const uploadLabel = avatarContainer?.querySelector('div');
        if (uploadLabel) uploadLabel.textContent = "[ UPLOADING... ]";

        const res = await settingService.updateAvatar(base64String);

        if (uploadLabel) uploadLabel.textContent = "[ UPLOAD ]";

        if (res.success === "true" && avatarContainer)
        {
          let imgEl = avatarContainer.querySelector('img');
          if (imgEl)
            imgEl.src = base64String;
          else
          {
            avatarContainer.querySelector('span')?.remove();
            imgEl = document.createElement('img');
            imgEl.className = "w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all";
            imgEl.src = base64String;
            avatarContainer.prepend(imgEl);
          }
        }
        else
        {
          if (avatarError) {
            avatarError.textContent = `> ERROR: ${res.message}`;
            avatarError.classList.remove('hidden');
          }
        }
      };
      reader.readAsDataURL(file);
    });

    changeProfileBtn?.addEventListener('click', async () => {
      const newUsername = usernameInput.value.trim();
      
      if (!newUsername) return;

      const userRes = await settingService.changeUsernameOnUserService(newUsername) as any;
      
      if (userRes.success === "false" || userRes.success === false)
      {
        const errorText = userRes.message || "USERNAME UPDATE FAILED";
        showMessage('profile-msg', '> ERROR: ' + errorText.toUpperCase(), true);
        return;
      }
      showMessage('profile-msg', '> SUCCESS: PROFILE UPDATED', false);
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
        showMessage('password-msg', '> ERROR: FIELDS REQUIRED', true);
        return;
      }

      if (newPw !== repeatPw)
      {
        showMessage('password-msg', '> ERROR: PASSWORDS MISMATCH', true);
        return;
      }

      const res = await settingService.changePassword(currentPw, newPw);

      if (res.success === "true")
      {
        showMessage('password-msg', '> SUCCESS: PASSWORD CHANGED', false);
        currentPwInput.value = '';
        newPwInput.value = '';
        repeatPwInput.value = '';
      }
      else
      {
        showMessage('password-msg', '> ERROR: ' + res.message, true);
      }
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
      const confirmDelete = confirm("> SYSTEM WARNING: Delete account? This cannot be undone.");
      if (confirmDelete) {
        console.log('Delete account confirmed');
      }
    });
  }
}

customElements.define('settings-page', SettingsPage);
