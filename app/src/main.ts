import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Preline for interactive components (dropdowns, modals, etc.)
import('preline').then(() => {})
