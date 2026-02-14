import  { userCreateData } from "./types"

class AuthService {
    
  async createUser(data: userCreateData)
  {
    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/register`);

    try {
      const response = await fetch(`${url}`.toString(), 
      {   
        method: 'POST',
        headers: {
          'content-Type': 'application/json',
        },
          body: JSON.stringify(data)
      });

      return (response);
    } catch (error)
    {
      console.log("could not fetsh the user data");
      return null;
    }
  }

  async login(identifier: string, password: string)
  {
    const url = new URL(`${import.meta.env.VITE_API_GATEWAY_URL}/api/auth/login`);

    try {
      const response = await fetch(`${url}`.toString(), 
      {   
        method: 'POST',
        headers: {
          'content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password: password })
      });

      if (!response.ok)
      {
        const err = await response.json();
        throw new Error(err.error);
      } 
      return  { success: true };
    } catch (error)
    {
      console.log("Login error", error);
      return null;
    }
  }
}


export const authService = new AuthService();
