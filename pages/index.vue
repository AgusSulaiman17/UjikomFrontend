<template>
  <HeroLanding />
</template>

<script>
import HeroLanding from '~/components/HeroLanding.vue';

export default {
  name: 'IndexPage',
  layout:'blank',
  components: {
    HeroLanding,
  },
  middleware: 'auth', 
}
</script>
