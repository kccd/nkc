<template lang="pug">
  .page-header
    .page-header-left
    .page-header-center {{title}}
    .page-header-right
</template>

<style scoped lang="less">
  @height: 4rem;
  .page-header{
    margin: 0;
    height: @height;
    box-shadow: 1px 1px 13px -7px rgba(0,0,0,0.66);
    border-bottom: 1px solid #ddd;
    position: relative;
    padding: 0 @height;
    .page-header-center{
      line-height: @height;
      text-align: center;
      font-size: 1.3rem;
    }
    .page-header-left, .page-header-right{
      position: absolute;
      top: 0;
      left: 0;
      background-color: red;
      height: 100%;
      width: @height;
    }
    .page-header-right{
      left: auto;
      right: 0;
    }
  }
</style>

<script>
  export default {
    props: ['title'],
    data: () => ({

    }),
    methods: {

    }
  }
</script>