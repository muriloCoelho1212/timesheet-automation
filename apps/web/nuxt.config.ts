export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/apollo',
    '@nuxt/eslint'
  ],
  apollo: {
    clients: {
      default: {
        httpEndpoint: 'http://localhost:3001/graphql'
      }
    },
  },
  css: ['~/assets/css/main.css'],
  pages: false,
  eslint: {
    config: {
      stylistic: false
    }
  },
  compatibilityDate: '2024-11-01',
})
