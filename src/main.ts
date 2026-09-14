import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import './style.css'

const vuetify = createVuetify()

createApp(App).use(vuetify).mount('#app')
