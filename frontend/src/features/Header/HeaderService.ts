
class HeaderService {
  async fetchUnreadNotifications() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/notifications`,
        {
          headers: { Authorization: "include" },
        },
      );

      if (!response.ok)
        return [];

      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async markAsRead()
  {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_GATEWAY_URL}/api/chat/mark-read`,
                  { method: 'POST' }
                  );
    } catch (error) {
      console.error("");
    }
  }
}

export const headerService = new HeaderService();
