import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({ token: localStorage.getItem("token"), user: null }),
  getters: { isAuthenticated: (s) => !!s.token },
  actions: {
    async login({ email, password }) {
      // MOCK credenciais
      if (email === "admin@admin" && password === "123") {
        this.token = "demo-token"; localStorage.setItem("token", this.token);
        this.user = { name: "Leonardo", email };
        return;
      }
      throw new Error("Credenciais inválidas");
    },
    logout() { this.token = null; this.user = null; localStorage.removeItem("token"); }
  }
});
