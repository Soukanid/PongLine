import { router } from '../../core/Router';
import { appStore } from '../../core/Store';

class SettingService {

  async changeUsernameOnUserService(newUsername: string)
  { 
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/change-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername: newUsername })
      }) as any; 

      const data = await res.json();

      if (res && res.ok)
        return ({ "success" : "true"});
      else
        return ({ "success" : "false", "message": data.error})

      } catch (err) {
        return ({ "success": "false", "message": "Failed to update the Username"});       
      }
  }

  async changeUsernameOnAuthService(newUsername: string)
  { 
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/change-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername: newUsername })
      }) as any; 

      const data = await res.json();

      if (res && res.ok)
        return ({ "success" : "true"});
      else
        return ({ "success" : "false", "message": data.error})
      } catch (err) {
        return ({ "success": "false", "message": "Failed to update the Username"});       
      }
  }

  async getTFAStatus(){
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/2fa/status`, {
        method: 'GET',
      });

      const data = await res.json();

      if (res && res.ok)
        return (data.tfa);
      else
        return ({ "error" :  data.error });
        
    } catch (err) {
      return ({ "error": "Failed to update the Password" });
    }

  }

  async setup2FA(){
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/2fa/setup`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res && res.ok)
        return (data.qrCode);
      else
        return ({ "error" :  data.error });
        
    } catch (err) {
      return ({ "error": "Failed to update the Password" });
    }

  }

  async verify2FA(code : string){
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
      });

      const data = await res.json();

      if (res && res.ok)
        return ({success: "2FA enabled succesfully"});
      else
        return ({ "error" :  data.error });
        
    } catch (err) {
      return ({ "error": "Failed to update the Password" });
    }
  }

  async disableTFA(){
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        });

      const data = await res.json();

      if (res && res.ok)
        return ({ success : "true" });
      else
        return ({ "success" : "false", "message": data.error });
        
    } catch (err) {
      return ({ "success": "false", "message": "Failed to update the Password" });
    }

  }

  async changePassword(currentPassword: string, newPassword: string)
  {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword: currentPassword, 
          newPassword: newPassword 
        })
      });

      const data = await res.json();

      if (res && res.ok)
        return ({ "success" : "true" });
      else
        return ({ "success" : "false", "message": data.error });
        
    } catch (err) {
      return ({ "success": "false", "message": "Failed to update the Password" });
    }
  }

  async updateAvatar(avatarBase64: string)
  {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/change-avatar`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarBase64: avatarBase64 })
      });

      const data = await res.json();

      if (res && res.ok)
        return ({ "success" : "true", "message": data.message });
      else
        return ({ "success" : "false", "message": data.error });
        
    } catch (err) {
      return ({ "success": "false", "message": "Failed to update the Avatar" });
    }
  }
  
  async purgeAccount(){
    try {
      const res = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/delete`, {
        method: 'DELETE',
      });
      const data = await res.json();
    
      if (res && res.ok)
      {
        return ({ "success" : "true" });
      }
      else
        return ({ "success" : "false", "message": data.error });
        
    } catch (err) {
      return ({ "success": "false", "message": "Failed to delete the Account" });
    }
  }
}


export const settingService = new SettingService();
