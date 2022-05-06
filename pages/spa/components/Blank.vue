<template lang="pug">
  .blank(:style="style") 空空如也~

</template>

<style lang="less">
  .blank{
    width: 100%;
    text-align: center;
    font-size: 1.25rem;
  }
</style>

<script>
  export default {
    props: ['height'],
    data: () => ({

    }),
    computed: {
      style() {
        const h = this.height || '10rem';
        return `height: ${h}; line-height: ${h};`
      }
    }
  }
</script>
