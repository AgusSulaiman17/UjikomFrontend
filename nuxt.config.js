export default {
  head: {
    title: 'Website Peminjaman Buku',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    'bootstrap/dist/css/bootstrap.css',
    'bootstrap-vue/dist/bootstrap-vue.css',
    '~/assets/css/main.css'
  ],

  plugins: [
    '~/plugins/bootstrap-vue.js',
    { src: '~/plugins/vue-toastification.js', ssr: false }
  ],

  components: true,

  buildModules: [],

  middleware: ['auth'],

  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
  ],

  axios: {
    baseURL: 'http://localhost:8080',
    credentials: true
  },

  build: {},
  router: {
    extendRoutes(routes, resolve) {
      routes.push(
        {
          name: 'detail-buku',
          path: '/detail-buku/:id_buku',
          component: resolve(__dirname, 'pages/user/DetailBuku.vue'),
        },
      );
    }
  }
}
