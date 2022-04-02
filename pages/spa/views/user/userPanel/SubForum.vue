<template lang="pug">
  .sub-forums
    .panel-header 关注的领域
    .m-b-2
      .user-card-sub-div
        .home-topic-item-div
          a(
            v-for="f in forums"
            :href="`/f/${f.fid}`"
            :style="`background-color: ${f.color || '#808080'}`"
            :title="f.description"
          ).topic-item
            img(v-if="f.logo" :src="getUrl('forumLogo', f.logo)")
            span {{f.displayName}}
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.sub-forums {
  .panel-header {
    margin: -15px -15px 1rem -15px;
    border-bottom: 1px solid #f4f4f4;
    padding: 0 1rem;
  }
}
</style>
<script>
export default {
  props: ['forums'],
  data: () => ({

  })
}
</script>
