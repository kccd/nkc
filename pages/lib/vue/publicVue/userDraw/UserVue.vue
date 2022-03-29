<template lang="pug">
  .user-draw(v-if="remote.uid")
    .user-draw-header
    .user-draw-avatar
      img(:src="remote.userInfo.avatar")
    .user-draw-username {{remote.userInfo.name}}
    .user-draw-certs {{remote.userInfo.certsName}}
    div
      user-score(:scores="remote.userInfo.scores")

</template>

<script>
import userScore from "./userScoresVue";
export default {
  props: ["remote"],
  data: () => ({
  }),
  components: {
    'user-score': userScore,
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.user-draw-header{
  height: 2.5rem;
  position: relative;
}
.user-draw-avatar{
  text-align: center;
  img{
    height: 6rem;
    width: 6rem;
    border-radius: 50%;
  }
}
.user-draw-username{
  text-align: center;
  margin: 0.4rem 0.5rem 0 0.5rem;
  line-height: 2rem;
  font-size: 1.2rem;
  font-weight: 700;
}
.user-draw-certs{
  text-align: center;
  color: #e85a71;
  margin: 0 0 0.5rem 0;
  line-height: 2rem;
  font-size: 1rem;
}
</style>
