<template lang="pug">
  .bread-crumb
    span.bread-crumb-item(v-for="(l, index) in list")
      span.bread-crumb-slash(v-if="index !== 0") /
      span.bread-crumb-name(@click="navToPage(l.page)" :class="{'weight': !!l.page}") {{l.name}}
</template>

<style lang="less">
.bread-crumb{
  .bread-crumb-item{
    font-size: 1.3rem;
    .bread-crumb-slash{
      padding: 0 0.5rem;
    }
    .bread-crumb-name{
      &.weight{
        font-weight: 700;
        cursor: pointer;
      }
    }
  }
}
</style>

<script>
export default {
  props: ['list'],
  methods: {
    navToPage(name) {
      if(!name) return;
      this.$router.push({name});
    }
  }
}
</script>