import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base is "/" because the site is served from the custom domain root
export default defineConfig({
  plugins: [react()],
  base: "/",
});
