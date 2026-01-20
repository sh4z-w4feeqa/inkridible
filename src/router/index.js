import { createRouter, createWebHistory } from "vue-router"
import WriteHere from "../views/WriteHere.vue"
import { getAuth } from "firebase/auth"

import Auth from "@/views/Auth.vue"
import Verify from "@/views/Verify.vue"
import Dashboard from "@/views/Dashboard.vue"
import Profile from "@/views/Profile.vue"
import Settings from "@/views/Settings.vue" 

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/auth" },
    { path: "/auth", component: Auth },
    { path: "/verify", component: Verify, meta: { requiresAuth: true } },
    { path: "/writehere", component: WriteHere, meta: { requiresAuth: true, requiresVerified: true } },
    { path: "/profile", component: Profile, meta: { requiresAuth: true } },
    { path: "/settings", component: Settings, meta: { requiresAuth: true } },
    { path: "/:catchAll(.*)", redirect: "/auth" }
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (to.meta.requiresAuth && !user) {
    return next("/auth")
  }

  if (to.path === "/auth" && user) {
    await user.reload()
    return next(user.emailVerified ? "/writehere" : "/verify")
  }

  if (to.meta.requiresVerified && user) {
    await user.reload()
    if (!user.emailVerified) {
      return next("/verify")
    }
  }

  next()
})

export default router