import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    sidebarOpen: true,
    theme: "light",
  }),

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
  },
});
