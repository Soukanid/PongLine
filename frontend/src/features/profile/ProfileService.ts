
class ProfileService {

  async createTourn(name : string)
  {
    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/create`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'content-Type': 'application/json'
      },
      body: JSON.stringify({ tour_name: name })
    });
    
    if (!response.ok)
      console.log("failed to create ");
     
  }
}

export const profileService = new ProfileService();
