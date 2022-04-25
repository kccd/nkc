<template lang="pug">
  //- 用户等级
  .account-user-level
    img.user-level-icon(:src="`/statics/grade_icon/v${targetUser.grade._id}l.png`" :title="targetUser.grade.displayName")
    span {{targetUser.info.certsName}}
</template>
<style lang="less" scoped>
.account-user-level{
  font-size: 1rem;
}
.user-level-icon {
  height: 1.2rem;
  width: 1.2rem;
  margin-right: 0.5rem;
  @media (max-width: 768px){
    height: 1rem;
    width: 1rem;
  }
}
</style>

<script>
export default {
  props: ['targetUser'],
}

</script>
