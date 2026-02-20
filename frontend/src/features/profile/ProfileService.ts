
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
}

export const profileService = new ProfileService();
