<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { auth } from "@/firebase"
import {
  sendPasswordResetEmail,
  signOut,
  updateEmail,
  deleteUser,
} from "firebase/auth"

const router = useRouter()
const user = auth.currentUser

const newEmail = ref("")
const loading = ref(false)
const message = ref("")
const error = ref("")

const goBack = () => {
  router.push("/writehere")
}

const changeEmail = async () => {
  if (!newEmail.value) return
  loading.value = true
  message.value = ""
  error.value = ""
  try {
    await updateEmail(user, newEmail.value)
    message.value = "Email updated! Please verify your new email."
    await sendPasswordResetEmail(auth, newEmail.value)
    newEmail.value = ""
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  if (!user?.email) return
  loading.value = true
  message.value = ""
  error.value = ""
  try {
    await sendPasswordResetEmail(auth, user.email)
    message.value = "Password reset email sent. Check your inbox."
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  await signOut(auth)
  router.push("/auth")
}

const deleteAccount = async () => {
  if (!confirm("Are you sure? This will permanently delete your account.")) return
  loading.value = true
  message.value = ""
  error.value = ""
  try {
    await deleteUser(user)
    router.push("/auth")
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <!-- Back button top-left -->
      <button class="back-btn" @click="goBack">← Back</button>

      <!-- Title centered -->
      <h1>Account Settings</h1>

      <!-- User Email -->
      <p class="current-email">Current: {{ user?.email }}</p>

      <!-- Change Email -->
      <label>New Email</label>
      <input v-model="newEmail" type="email" placeholder="Enter new email" />
      <button class="primary" @click="changeEmail" :disabled="loading">
        {{ loading ? "Processing…" : "Change Email" }}
      </button>

      <!-- Reset Password -->
      <button class="secondary" @click="resetPassword" :disabled="loading">
        {{ loading ? "Sending…" : "Reset Password" }}
      </button>

      <!-- Logout -->
      <button class="secondary" @click="logout">
        Logout
      </button>

      <!-- Delete Account -->
      <button class="danger" @click="deleteAccount" :disabled="loading">
        {{ loading ? "Deleting…" : "Delete Account" }}
      </button>

      <!-- Messages -->
      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
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
  background: linear-gradient(135deg, #c3f0f9, #d9c3f9);
}

.card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  color: #222;
  text-align: center;
  position: relative;
}

.back-btn {
  text-align: left;
  top: 1.5rem;
  left: 1.5rem;
  background: transparent;
  border: none;
  font-size: 1.4rem;
  font-weight: bold;
  color: #4f46e5;
  cursor: pointer;
}
.back-btn:hover {
    box-shadow: transparent
}
h1 {
  font-size: 2rem;
  margin: 0;
  margin-bottom: 2rem;
  color: #4f46e5;
}

.current-email {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #6b7280;
  word-break: break-all;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 1rem;
  color: #374151;
  text-align: left;
}

input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.85);
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
  cursor: pointer;
  margin-bottom: 0.8rem;
  transition: transform 0.15s, box-shadow 0.15s;
}

.primary {
  background: #a78bfa;
  color: white;
}

.secondary {
  background: transparent;
  border: 1px solid #a78bfa;
  color: #4f46e5;
}

.danger {
  background: #f87171;
  color: white;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(167, 139, 250, 0.35);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #34d399;
  margin-top: 1rem;
}

.error {
  color: #f87171;
  margin-top: 1rem;
  word-break: break-word;
}
</style>
