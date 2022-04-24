<template lang="pug">
  .account-url
    .account-link(v-if="navLink" v-for="navLink in navLinks")
      .panel-header(v-if="navLink.name") {{navLink.name}}
      .account-lis
        .account-li(v-for="link in navLink.links" @click="toRoute(link.url)" :class="{'active': link.type === ''}")
          .name {{link.name}}
            span {{link.count || ''}}
          .fa.fa-angle-right
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
  .account-url{
    padding: 0!important;
    @liHeight: 4rem;
    .account-lis .account-li:first-child .name{
      border-top: none;
    }
    position: relative;
    padding: 0.5rem 0;
    transition: box-shadow 300ms;
    .account-li{
      display: block;
      height: @liHeight;
      line-height: @liHeight;
      font-size: 1.2rem;
      color: #555;
      position: relative;
      text-decoration: none;
      cursor: pointer;
      & .name{
        border-top: 1px solid #eee;
      }
      & span{
        margin-left: 1rem;
      }
      &:hover, &.active{
        text-decoration: none;
        color: @primary;
      }
      & .fa{
        position: absolute;
        height: @liHeight;
        line-height: @liHeight;
        font-size: 1.6rem;
        top: 0;
        width: @liHeight;
        text-align: center;
        right: 0;
      }
    }
  }
</style>
<script>
export default {
  props: ['nav-links'],
  data: () => ({
  }),
  methods: {
    toRoute(path) {
      this.$router.push({
        path
      });
    }
  }

}
</script>
