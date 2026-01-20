<script setup>
import { ref } from "vue"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/firebase"

const email = ref("")
const message = ref("")
const error = ref("")
const loading = ref(false)

const resetPassword = async () => {
  error.value = ""
  message.value = ""
  loading.value = true

  try {
    await sendPasswordResetEmail(auth, email.value)
    message.value = "Password reset email sent. Check your inbox."
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
      <h1 class="brand">Inkridible</h1>
      <p class="subtitle">Reset your password</p>

      <form @submit.prevent="resetPassword">
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <button :disabled="loading">
          {{ loading ? "Sending..." : "Send Reset Email" }}
        </button>

        <p v-if="message" class="success">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #cce7ff, #e9d6ff); /* pastel gradient */
  font-family: system-ui, -apple-system, BlinkMacSystemFont;
}

.card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 22px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15);
  color: #222;
  text-align: center;
}

.brand {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.8rem;
}

input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid #ccc;
  font-size: 1rem;
  background: #fff;
  color: #222;
}

input:focus {
  outline: none;
  border-color: #4fc3f7;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.25);
}

button {
  width: 100%;
  padding: 0.8rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #4fc3f7;
  color: #222;
  transition: transform 0.15s, box-shadow 0.15s;
}

button:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(79, 195, 247, 0.35);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  margin-top: 1rem;
  color: #4fc3f7;
}

.error {
  margin-top: 1rem;
  color: #f87171;
}
</style>