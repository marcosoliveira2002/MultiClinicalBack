import { useAuthStore } from "../stores/auth";
export function authGuard(to) {
    if (to.meta?.public) return true;
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return { name: "login", query: { redirect: to.fullPath } };
    return true;
}
