
class HeaderService {

  async fetchUnreadNotifications()
  {
      try {
          const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/notifications`, {
             headers: { 'Authorization': 'include' }
          });

          if (!response.ok)
          {
            console.error("Failed to fetch notifications history");
            return [];
          }

          return await response.json();
      } catch (error) {
          console.error("Failed to fetch notifications", error);
          return [];
      }
  }

  async maskAsRead()
  {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/mark-read`,
                  { method: 'POST' }
                  );
      if (!response.ok)
      {
        console.error("Failed to mark the notifications as read");
      }
    } catch (error) {
        console.error("Failed to mark the notifications as read");
    }
  }
}


export const headerService = new HeaderService();
