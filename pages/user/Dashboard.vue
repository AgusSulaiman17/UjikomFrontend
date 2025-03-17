<template>
<div class="">
  <AppNavbar />
  <Slider class="mt-6"/>
  <BukuPopuler class="mt-6" />
  <Footer />
</div>
</template>

<script>
import AppNavbar from '~/components/AppNavbar.vue';
import BukuPopuler from '~/components/BukuPopuler.vue';
import Footer from '~/components/Footer.vue';
import Slider from '~/components/Slider.vue';

export default {
  components :{
    Slider,
    AppNavbar,
    BukuPopuler,
    Footer
  },
  layout:'blank'
}
</script>

<style scoped>
.mt-6{
  margin-top: 150px;
}
</style>
