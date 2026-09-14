import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FAFAF9',
          surface: '#FAFAF9',
          primary: '#1C1917',
          secondary: '#0F766E',
          error: '#DC2626',
          warning: '#92400E',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 0,
      variant: 'flat',
      color: 'primary',
    },
    VBtnToggle: {
      rounded: 0,
    },
  },
})
