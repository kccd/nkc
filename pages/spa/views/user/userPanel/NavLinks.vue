<template lang="pug">
  .nav-links
    .account-url(v-if="navLink" v-for="navLink in navLinks")
      .account-name(v-if="navLink.name") {{navLink.name}}
      .account-lis
        a.acocunt-li(v-for="link in navLink.links" :href="link.url" :class="{'active': link.type === ''}")
          .name {{link.name}}
            span {{link.count || ''}}
          .fa.fa-angle-right
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.nav-links {
  .account-url{
    @liHeight: 4rem;
    border-top: 1px solid #eee;
    .account-lis .account-li:first-child .name{
      border-top: none;
    }
    position: relative;
    padding: 0.5rem 0;
    transition: box-shadow 300ms;
    .account-name{
      @accountNameHeight: 1.4rem;
      height: @accountNameHeight;
      line-height: @accountNameHeight;
      width: 100%;
      text-align: center;
      font-size: 1rem;
      border-radius: @accountNameHeight / 2;
    }
    &:hover{
      box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.2);
    }
    .account-li{
      display: block;
      height: @liHeight;
      line-height: @liHeight;
      padding: 0 @liHeight 0 2rem;
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
      .fa{
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
}
</style>
<script>
import {nkcAPI} from "../../../../lib/js/netAPI";

export default {
  props: ['nav-links'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {
  }

}
</script>
