<template lang="pug">
.creation-center
  .creation-nav-container
    creation-nav(@select="selectNavItem")
  .creation-nav-container-phone.col-xs-12.col-md-9(:class="{'creation-nav-container-isApp': isApp}")
    creation-nav(@select="selectNavItem")
  .creation-content-container
    transition(:name="transitionName")
      router-view(v-if="isRouterAlive")
</template>
<script>
import VerNav from "./components/VerNav";
import { getState } from "../lib/js/state";
import { visitUrl } from "../lib/js/pageSwitch";

export default {
  components: {
    "creation-nav": VerNav,
  },
  data: () => ({
    transitionName: "fade",
    isRouterAlive: true,
    isApp: false
  }),
  watch: {
    $route(to, from) {
      const toDepth = to.path.split("/").length;
      const fromDepth = from.path.split("/").length;
      this.transitionName = toDepth < fromDepth ? "fade" : "fade";
    },
  },
  created(){
    const { isApp } = getState();
    this.isApp = isApp;
  },
  methods: {
    navToPage(page, url) {
      // // console.log()
      if (this.isApp) {
        visitUrl(url);
        return;
      }
      this.$router.push({ name: page });
    },
    selectNavItem(type, url) {
      this.navToPage(type, url);
    },
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(() => (this.isRouterAlive = true));
    },
  },
};
</script>
<style lang="less" scoped>
@import "../publicModules/base";
@leftNavWidth: 20rem;
@paddingTop: 5rem;
@max-width: 1000px;
.creation-nav-container-isApp{
  margin-top: 3rem !important;
}
.creation-nav-container {
  position: fixed;
  background-color: #fff;
  height: 100%;
  top: 0;
  padding-top: @paddingTop + 1rem;
  left: 0;
  width: @leftNavWidth;
}
.creation-center {
  @media screen and(max-width: @max-width) {
    padding-left: 0;
    padding-top: 0;
  }
  padding-top: 2rem;
  padding-left: @leftNavWidth;
  padding-bottom: 3rem;
  .creation-content-container {
    @media screen and(max-width: @max-width) {
      // padding: 1rem;
    }
  }
}
@media screen and (max-width: @max-width) {
  .creation-nav-container {
    display: none;
  }
  .creation-nav-container-phone {
    display: block;
    margin-bottom: 2rem;
    margin-top: 1.5rem;
  }
}
@media screen and (min-width: @max-width) {
  .creation-nav-container-phone {
    display: none;
    height: 20rem;
    .creation-center {
      padding-left: @leftNavWidth;
    }
  }
}
</style>
