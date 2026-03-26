import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initAnalytics } from './analytics'

initAnalytics()
createApp(App).mount('#app')
