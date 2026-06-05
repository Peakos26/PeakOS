import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, push, update, remove, onValue } from 'firebase/database'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyA0v3twc3UsKuh2hgehkAwA2K74J06KcLM",
  authDomain: "mygym-ebc54.firebaseapp.com",
  databaseURL: "https://mygym-ebc54-default-rtdb.firebaseio.com",
  projectId: "mygym-ebc54",
  storageBucket: "mygym-ebc54.firebasestorage.app",
  messagingSenderId: "821706486657",
  appId: "1:821706486657:web:c7d9ed81554e2d1a792e80",
  measurementId: "G-3QV0WNZR9Y"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const functions = getFunctions(app)

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export { app, database, functions, ref, get, set, push, update, remove, onValue }
