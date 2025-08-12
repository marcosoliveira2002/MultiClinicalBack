import { createRouter, createWebHistory } from "vue-router";
import { authGuard } from "./guards";

const Login = () => import("../pages/auth/Login.vue");
const Forgot = () => import("../pages/auth/Forgot.vue");
const AppLayout = () => import("../layouts/AppLayout.vue");
const Dashboard = () => import("../pages/Dashboard.vue");
const UsersList = () => import("../pages/users/UsersList.vue");

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: Login, name: "login", meta: { public: true } },
    { path: "/forgot", component: Forgot, name: "forgot", meta: { public: true } },
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", name: "dashboard", component: Dashboard },
        { path: "users", name: "users", component: UsersList },
      ],
    },
  ],
});

router.beforeEach(authGuard);
export default router;
