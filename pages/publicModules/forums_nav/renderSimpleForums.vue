<template lang="pug">
  .simpleForum-container
    .simpleForum-content(v-for="forum in forums")
      a.simpleForum-parent-name(:href="getUrl('forumHome', forum.fid)"
        data-global-mouseover="showUserPanel"
        data-global-mouseout="hideUserPanel"
        :data-global-data="objToStr({fid: forum.fid})"
      ) {{forum.displayName}}
      span.simpleForum-name-box(v-for="(cf, index) in forum.childrenForums")
        span(v-if="index === 0") :
        span(v-else) |
        a.simpleForum-child-name(:href="getUrl('forumHome', cf.fid)"
          data-global-mouseover="showForumPanel"
          data-global-mouseout="hideForumPanel"
          :data-global-data="objToStr({fid: cf.fid})"
          :data-float-fid="cf.fid" :style="'backgroundColor:' + bgc(cf.color, 0.1)") {{cf.displayName}}
</template>

<script>
import {getUrl, objToStr} from "../../lib/js/tools";
import hexToRgba from "hex-to-rgba";
export default {
  props: ["forums"],
  data: () => ({
  }),
  components: {
  },
  mounted() {
  },
  methods: {
    objToStr: objToStr,
    getUrl: getUrl,
    bgc(color, alpha){
      return hexToRgba(color, alpha);
    }
  }
}
</script>

<style lang="less" scoped>
.simpleForum-container{
  .simpleForum-content{
    margin-bottom: 0.3rem;
    .simpleForum-parent-name{
      color: #333;
      font-size: 1.2rem;
      font-weight: 700;
      display: inline-block;
    }
    .simpleForum-name-box{
      a{
        color: #000;
        font-size: 1.2rem;
        margin: 0 0.2rem;
      }
    }
  }
}
</style>
