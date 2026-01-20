<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import { auth, db } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"

const router = useRouter()

/* 🌸 Ordered pastel colors */
const NOTE_COLORS = [
  "rgba(255, 249, 196, 0.85)", // butter yellow
  "rgba(255, 229, 208, 0.85)", // peach cream
  "rgba(250, 218, 221, 0.85)", // blush pink
  "rgba(232, 248, 245, 0.85)", // mint milk
  "rgba(238, 233, 255, 0.85)", // lavender mist
]

const user = ref(null)
const newNote = ref("")
const notes = ref([])
const inputRef = ref(null)

/* Modal editing */
const activeNote = ref(null)
const modalDraft = ref("")
const modalStyle = ref({})

let notesCol = null
let unsubscribe = null

/* Logout */
const logout = async () => {
  await auth.signOut()
  router.replace("/auth")
}

/* Navigate to Settings */
const goToSettings = () => {
  router.push("/settings")
}

/* Load user + notes */
onMounted(() => {
  onAuthStateChanged(auth, u => {
    if (!u) {
      router.replace("/auth")
      return
    }

    user.value = u
    notesCol = collection(db, "users", u.uid, "notes")
    const q = query(notesCol, orderBy("createdAt", "desc"))

    unsubscribe = onSnapshot(q, snapshot => {
      notes.value = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))
    })
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

/* Add note */
const addNote = async () => {
  if (!newNote.value.trim() || !notesCol) return

  const colorIndex = notes.value.length % NOTE_COLORS.length

  await addDoc(notesCol, {
    text: newNote.value.trim(),
    colorIndex,
    createdAt: serverTimestamp(),
  })

  // Clear input
  newNote.value = ""
  nextTick(() => inputRef.value?.focus())
}

/* Delete single note */
const deleteNote = async (note) => {
  await deleteDoc(doc(db, "users", user.value.uid, "notes", note.id))
}

/* Delete all notes */
const deleteAllNotes = async () => {
  if (!notes.value.length) return
  const confirmDelete = confirm(
    "Are you sure you want to delete ALL your notes? This cannot be undone!"
  )
  if (!confirmDelete) return

  await Promise.all(
    notes.value.map(n =>
      deleteDoc(doc(db, "users", user.value.uid, "notes", n.id))
    )
  )
}

/* Open modal editor */
const openEditor = (note, event) => {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  modalStyle.value = {
    top: rect.top + "px",
    left: rect.left + "px",
    width: rect.width + "px",
    height: rect.height + "px",
    transform: "translate(0,0) scale(1)",
    transition: "none",
  }
  activeNote.value = note
  modalDraft.value = note.text
  nextTick(() => {
    modalStyle.value = {
      top: "50%",
      left: "50%",
      width: "90%",
      maxWidth: "600px",
      height: "auto",
      transform: "translate(-50%, -50%) scale(1)",
      transition: "all 0.25s ease",
    }
    document.getElementById("modal-textarea")?.focus()
  })
}

/* Save modal edit */
const saveModal = async () => {
  if (!activeNote.value || !notesCol) return

  if (modalDraft.value.trim() !== activeNote.value.text) {
    await updateDoc(doc(db, "users", user.value.uid, "notes", activeNote.value.id), {
      text: modalDraft.value.trim(),
    })
    activeNote.value.text = modalDraft.value.trim()
  }
  closeModal()
}

/* Close modal */
const closeModal = () => {
  activeNote.value = null
  modalDraft.value = ""
}
</script>

<template>
  <div class="page">
    <header>
      <div>
        <h1>Inkridible</h1>
        <p>Welcome, {{ user?.email }}</p>
        <button class="settings-btn" @click="router.push('/settings')">
          Settings
        </button>
      </div>
    </header>

    <p v-if="!notes.length" class="empty">
      No notes yet. Start writing ✍️
    </p>

    <!-- Notes Grid -->
    <section class="notes-grid">
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-card"
        :style="{ backgroundColor: NOTE_COLORS[note.colorIndex] }"
        @dblclick="(e) => openEditor(note, e)"
      >
        <div class="note-text">{{ note.text }}</div>

        <div class="actions">
          <button class="delete-btn" @click.stop="deleteNote(note)">×</button>
        </div>
      </div>
    </section>

    <!-- New Note Input -->
    <div class="new-note-wrapper">
      <input
        ref="inputRef"
        v-model="newNote"
        type="text"
        placeholder="Write a new note…"
        @keyup.enter="addNote"
      />
      <button class="add-note" @click="addNote">+</button>
    </div>

    <!-- Delete All Notes Button -->
    <div class="delete-all-wrapper">
      <button class="delete-all-btn" @click="deleteAllNotes">
        Delete All Notes
      </button>
    </div>

    <!-- Modal Editor -->
    <div v-if="activeNote" class="modal-overlay" @click.self="closeModal">
      <div
        class="modal-card"
        :style="[modalStyle, { backgroundColor: NOTE_COLORS[activeNote.colorIndex] }]"
      >
        <textarea
          id="modal-textarea"
          v-model="modalDraft"
          class="modal-textarea"
          @keydown.enter.prevent="($event) => { if (!$event.shiftKey) saveModal() }"
          @keydown.esc.prevent="closeModal"
        ></textarea>

        <div class="modal-actions">
          <button class="cancel-btn" @click.stop="closeModal">Cancel</button>
          <button class="save-btn" @click.stop="saveModal">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap");

.page {
  min-height: 100vh;
  font-family: "Patrick Hand", cursive;
  padding: 1rem;
  color: #222;
  background: linear-gradient(135deg, #a3cef1, #d0e7ff); /* restored pastel blue gradient */
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
header h1 { margin:0; font-size:2.5rem; }
header p { margin:0.25rem 0 0; font-size:1.5rem; color:#555; }

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.logout {
  padding:0.4rem 0.8rem;
  border-radius:8px;
  border:none;
  background:#ffcc33;
  color:#222;
  cursor:pointer;
}

.settings-btn {
  padding:0.4rem 0.8rem;
  border-radius:8px;
  border:none;
  background:#9162d7;
  color:#e9dede;
  cursor:pointer;
  font-weight:bold;
}

.settings-btn:hover {
  transform: translateY(-2px);
  transition:0.2s;
  box-shadow:0 5px 15px rgba(0,0,0,0.15);
}

/* Notes grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

/* Note card */
.note-card {
  height: 200px;
  padding: 1rem;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.15s;
}
.note-card:hover { transform: translateY(-3px); }

.note-text {
  flex: 1;
  overflow-y: auto;
  font-size: 1.5rem;
  line-height: 1.6;
}

/* Actions */
.actions { display: flex; justify-content: flex-end; }
.delete-btn { background: #fca5a5; border: none; border-radius: 6px; cursor: pointer; color:#222; padding:0.25rem 0.5rem; }

/* Delete All Notes Button */
.delete-all-wrapper { display: flex; justify-content: right; margin-top: 2rem; }
.delete-all-btn { background: #f87171; color: #222; border: none; border-radius: 12px; padding: 0.8rem 1.5rem; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
.delete-all-btn:hover { transform: translateY(-2px); transition: 0.2s; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-card { position: fixed; border-radius: 18px; padding: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; }
.modal-textarea { width: 100%; min-height: 250px; border: none; border-radius: 12px; padding: 1rem; font-family: inherit; font-size: 1.25rem; line-height: 1.6; resize: none; background: rgba(255,255,255,0.75); color: #222; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.cancel-btn { background: #e5e7eb; border: none; border-radius: 8px; padding: 0.5rem 1rem; }
.save-btn { background: #fde68a; border: none; border-radius: 8px; padding: 0.5rem 1rem; }

/* New note input */
.new-note-wrapper { position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.5rem; width: 90%; max-width: 500px; }
.new-note-wrapper input { flex: 1; padding: 0.8rem; border-radius: 16px; border: 1px solid #ddd; }
.add-note { width: 3rem; border-radius: 50%; background: #fff1a8; border: none; font-weight: bold; }

/* Empty message */
.empty { text-align: center; font-style: italic; color: #555; margin-top:2rem; }
</style>
