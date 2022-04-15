<template lang="pug">
  .creation-center
    .creation-nav-container
      creation-nav(@select="selectNavItem")
    .creation-nav-container-phone.standard-max-container(:class="{'creation-nav-container-isApp': isApp}")
      creation-nav(@select="selectNavItem")
    .creation-content-container
      transition(:name="transitionName")
        home(v-if="showHome")
        router-view(v-if="isRouterAlive")
</template>
<script>
import VerNav from "../../components/VerNav";
import { getState } from "../../../lib/js/state";
import { visitUrl, setPageTitle } from "../../../lib/js/pageSwitch";
import Home from "./Home"
export default {
  components: {
    "creation-nav": VerNav,
    "home": Home
  },
  data: () => ({
    transitionName: "fade",
    isRouterAlive: true,
    isApp: false,
    showHome: false,
  }),
  beforeCreate() {
    $('body').css({
      backgroundColor: '#fff'
    })
  },
  beforeDestroy() {
    $('body').css({
      backgroundColor: ''
    })
  },
  watch: {
    "$route": {
      // immediate: true,
      handler(to, from){
        const toDepth = to.path.split("/").length;
        const fromDepth = from.path.split("/").length;
        this.transitionName = toDepth < fromDepth ? "fade" : "fade";
        this.isShowHome()
      }
    }
  },
  created(){
    const { isApp } = getState();
    this.isApp = isApp;
    this.isShowHome();
    setPageTitle('创作中心');
  },
  methods: {
    isShowHome(){
      if(this.$route.path === "/creation"){
        this.showHome = true;
      }else{
        this.showHome = false;
      }
    },
    navToPage(page, url) {
      if (this.isApp) {
        visitUrl(url, true);
        return;
      }
      if(page === 'home'){
        this.$router.push({ path: url });
      }else{
        this.$router.push({ name: page });
      }
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
@import "../../../publicModules/base";
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
    position: relative;
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
