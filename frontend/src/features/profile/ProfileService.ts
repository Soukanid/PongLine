
class ProfileService {

  async createTourn(name : string)
  {
    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/game/create`);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'content-Type': 'application/json'
      }
    });
  }
}
