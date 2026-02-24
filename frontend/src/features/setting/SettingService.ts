
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
        return ({ "seccess" : "false", "message": data.error})
      } catch (err) {
        return ({ "success": "false", "message": "Failed to update the Username"});       
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
}

export const settingService = new SettingService();
