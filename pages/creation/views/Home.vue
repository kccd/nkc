<template lang="pug">
  div
    h1 Home
    p 创作中心首页
</template>

<script>
  export default {
    data: () => ({

    }),
    methods: {
      navTo(name) {
        this.$router.push({name});
      }
    }
  }
</script>
