<template lang="pug">
  //- 用户等级
  .account-user-level
    span.user-grade(:style="`color: ${targetUser.grade.color};`")
      span {{targetUser.info.certsName}}
      img.grade-icon(:src="`/statics/grade_icon/v${targetUser.grade._id}l.png`" :title="targetUser.grade.displayName")
</template>
<style lang="less">

</style>

<script>
export default {
  props: ['targetUser'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {
  }
}

</script>
