import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],

  // INFO : here i faced a problem with vite, the default hosts
  // that vite accepts requests from are localhost and '127.0.0.1'
  // so when the reverse proxy on the nginx conf sends a request 
  // with the host fronend, vite does not allow it to access
  // so that is why i added the allowedHosts list

  server: {
    host: true,
    allowedHosts: [
      'frontend', 
    ]
  }
});
