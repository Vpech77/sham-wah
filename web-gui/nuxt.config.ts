// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Sham-Wah App",
      meta: [
        {
          name: "description",
          content:
            "Application for Querying and Discovering Ressources From A Knowledge Graph in Alpine Ecology",
        },
      ],
    },
  },

  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "@pinia/nuxt"],
});
