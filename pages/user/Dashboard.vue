<template>
<div class="">
  <AppNavbar />
  <Slider class="mt-6"/>
</div>
</template>

<script>
import AppNavbar from '~/components/AppNavbar.vue';
import Slider from '~/components/Slider.vue';

export default {
  components :{
    Slider,
    AppNavbar
  },
  layout:'blank'
}
</script>

<style scoped>
.mt-6{
  margin-top: 150px;
}
</style>
