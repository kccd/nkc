<template lang="pug">
  .user-info(v-if="targetUser")
    .code(v-if="code") {{"动态码："+code}}
    user-scores(ref="userScore" :scores="targetUserScores" :xsf="targetUser.xsf" )
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.user-info {
  .code {
    text-align: center;
    font-size: 1.5rem;
  }
}
</style>
<script>
import UserScoresVue from "../../../../lib/vue/publicVue/userDraw/UserScoresVue";
import {getState} from "../../../../lib/js/state";
export default {
  props: ['targetUser', 'code',"targetUserScores"],
  components:{
    "user-scores": UserScoresVue,
  },
  data: () => ({
    websiteCode: getState().websiteCode
  }),
  methods: {
  }
}
</script>
