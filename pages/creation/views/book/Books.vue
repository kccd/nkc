<template lang="pug">
  div
    h2 我的文档
    button(@click="navToPage('bookCreator')") 新建文档
</template>

<script>
  export default {
    data: () => ({
      books: []
    }),
    methods: {
      navToPage(name) {
        this.$router.push({name});
      }
    }
  }
</script>