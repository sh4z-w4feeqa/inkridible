<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { auth } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth"
import { getAuthErrorMessage } from "@/utils/authErrors"

const router = useRouter()

const mode = ref("login") // 'login' | 'signup'
const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref("")

// Redirect if already logged in
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    await user.reload()
    router.replace(
      user.emailVerified ? "/writehere" : "/verify"
    )
  }
})

const submit = async () => {
  error.value = ""
  loading.value = true

  try {
    if (mode.value === "login") {
      const cred = await signInWithEmailAndPassword(auth, email.value, password.value)
      await cred.user.reload()
      router.replace(cred.user.emailVerified ? "/writehere" : "/verify")
    } else {
      const cred = await createUserWithEmailAndPassword(auth, email.value, password.value)
      await sendEmailVerification(cred.user)
      router.replace("/verify")
    }
  } catch (err) {
    error.value = getAuthErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1 class="brand">Inkridible</h1>

      <p class="subtitle">
        {{ mode === "login" ? "Sign in to continue" : "Create your account" }}
      </p>

      <form @submit.prevent="submit">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="name@domain.com" required />

        <label>Password</label>
        <input v-model="password" type="password" placeholder="********" required />

        <button :disabled="loading">
          {{ loading ? "Please wait…" : mode === "login" ? "Login" : "Sign up" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <button
        class="toggle"
        @click="mode = mode === 'login' ? 'signup' : 'login'"
        :disabled="loading"
      >
        {{ mode === "login"
          ? "Don’t have an account? Sign up"
          : "Already have an account? Login" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");

.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Patrick Hand", cursive;
  background: linear-gradient(135deg, #c3f0f9, #d9c3f9); /* pastel blue → lavender */
}

.card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.9);
  padding: 2.5rem;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  color: #222;
  text-align: center;
}

.brand {
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
  color: #4f46e5; /* pastel purple accent */
}

.subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.25rem; /* increased font size */
  line-height: 1.5; /* better readability */
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: #374151;
}

input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  margin-bottom: 1.2rem;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: rgba(255,255,255,0.85);
  color: #222;
}

input:focus {
  outline: none;
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.25);
}

button {
  width: 100%;
  padding: 0.8rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  background: #a78bfa; /* pastel purple */
  color: white;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(167, 139, 250, 0.35);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #f87171;
  font-size: 0.9rem;
  text-align: center;
}

.toggle {
  margin-top: 1.8rem;
  background: transparent;
  color: #7c3aed;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
}

.toggle:hover {
  text-decoration: underline;
}
</style>