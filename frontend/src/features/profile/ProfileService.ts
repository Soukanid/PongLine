
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
  
  async getActiveTournaments() {
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

}

export const profileService = new ProfileService();
