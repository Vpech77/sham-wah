// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Sham-Wah App",
      meta: [
        { name: "description", content: "Description de mon application" },
      ],
    },
  },

  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
});
