<template lang="pug">
    div
      h1 Creation Center
      router-view
</template>
<script>
  export default {
    data: () => ({

    }),
    methods: {
      navToPage(page) {
        this.$router.push({name: page});
      }
    }
  }
</script>
