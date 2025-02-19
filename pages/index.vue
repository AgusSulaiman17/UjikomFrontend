<template>
  <div class="">
    <AppNavbar />
    <HeroLanding class="mt-6"/>
  </div>
</template>

<script>
import AppNavbar from '~/components/AppNavbar.vue';
import HeroLanding from '~/components/HeroLanding.vue';

export default {
  name: 'IndexPage',
  layout:'blank',
  components: {
    HeroLanding,
    AppNavbar
  },
  middleware: 'auth',
}
</script>

<style scoped>
.mt-6{
  margin-top: 150px;
}
</style>
