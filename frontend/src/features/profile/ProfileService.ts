
class ProfileService {

  async createTourn(name: string)
  {
    try {
      const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/create`);
    
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'content-Type': 'application/json'
        },
        body: JSON.stringify({ tour_name: name })
      });
      
      if (!response.ok)
        console.log("failed to create the tournament");
       
      return await response.json();
    } catch (error)
    {
      console.error(error);
    }
  }
  
  async joinTourn(tour_id: string)
  {
    try {
      const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/join`);
    
      const response = await fetch(url.toString(), {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tour_id: tour_id }) 
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join tournament");
      }
       
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getActiveTournaments()
  {
    try {
        const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/activeTournaments`);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          console.error("Failed to fetch active tournaments");
          return []; 
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return []; 
    }
  }

  async getMyTournament()
  {
    try {
      const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/my-tournament`);
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 204)
        return null;

      if (!response.ok)
        return null;
       
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getProfile(username: string)
  {
    try {
      
      let endpoint = "";

      if (username === "ME")
        endpoint = `${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/me`;
      else
        endpoint = `${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/profile?targetUsername=${username}`;
        
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        } 
      });

      if (!response.ok)
        return null;

      return await response.json();
    } catch (error)
    {
      console.error(error);
      return null;
    }
  }

  async getStats(username: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/stats/${username}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) 
        return null;
      
      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getMatchHistory(username: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/history/${username}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok)
        return [];

      const data = await response.json();
      return data.matches; 
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async executeUserAction(actionRoute: string, targetUsername: string)
  {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/user-management/${actionRoute}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUsername })
      });

      if (!response.ok)
        return false;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

export const profileService = new ProfileService();
