import { defineConfig } from "vitest/config";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [viteReact()],
        test: {
          name: "client",
          include: ["client/**/*.test.{js,jsx}"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.js"],
        },
      },
      {
        test: {
          name: "server",
          include: ["*.test.js"],
          environment: "node",
        },
      },
    ],
  },
});
