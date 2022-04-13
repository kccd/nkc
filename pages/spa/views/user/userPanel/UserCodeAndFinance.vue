<template lang="pug">
  .user-info(v-if="targetUser")
    .code {{"动态码："+code}}
    user-scores(ref="userScore" :scores="targetUserScores" :xsf="targetUser.xsf" )
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.user-info {
  .code {
    text-align: center;
    height: 3rem;
    line-height: 3rem;
    font-size: 1.5rem;
  }

}
</style>
<script>
import UserScoresVue from "../../../../lib/vue/publicVue/userDraw/UserScoresVue";
export default {
  props: ['targetUser', 'code',"targetUserScores"],
  components:{
    "user-scores": UserScoresVue,
  },
  data: () => ({
  }),
  methods: {
  }
}
</script>
