<template lang="pug">
  .bread-crumb
    span.bread-crumb-item(v-for="(l, index) in list")
      span.bread-crumb-slash(v-if="index !== 0") /
      span.bread-crumb-name(@click="navToPage(l)" :class="{'link': !!l.page || !!l.path}") {{l.name}}
</template>

<style lang="less">
@import '../../publicModules/base';
.bread-crumb{
  .bread-crumb-item{
    font-size: 1.3rem;
    .bread-crumb-slash{
      padding: 0 0.5rem;
    }
    .bread-crumb-name{
      &.link{
        cursor: pointer;
        color: @primary;
      }
    }
  }
}
</style>

<script>
export default {
  props: ['list'],
  methods: {
    navToPage(l) {
      const {page, path = '', query = {}, params = {}} = l;
      if(!page && !path) return;
      this.$router.push({
        name: page,
        path,
        query,
        params
      });
    }
  }
}
</script>
