<template lang="pug">
  .paging(v-if="pagesData.length" :style="containerStyle")
    span.paging-button(
      v-for="b in pagesData"
      :class="b.type"
      @click="clickButton(b)"
      ) {{b.value}}
</template>

<style lang="less" scoped>
  @import "../../publicModules/base";
  .paging{
    display: inline-block;
    span{
      height: 2rem;
      line-height: 2rem;
      border-radius: 2px;
      display: inline-block;
      margin-right: 0.3rem;
      color: #fff;
      text-align: center;
      padding: 0 0.7rem;
      font-size: 1rem;
      user-select: none;
      cursor: pointer;
      &.active{
        background-color: @primary;
      }
      &.null{
        color: #555;
        padding: 0 0.2rem;
        margin-top: 0;
        margin-bottom: 0;
      }
      &.common{
        background-color: @darkGray;
      }
      &:hover{
        opacity: 0.7;
      }
    }
    & span:last-child{
      margin-right: 0;
    }
  }
</style>

<script>
  export default {
    props: ['pages', 'pb', 'pt', 'mb', 'mt'],
    data: () => ({
    }),
    computed: {
      containerStyle() {
        const {pb = 0, pt = 0, mb = 0, mt = 0} = this;
        return (
          `padding-bottom: ${pb}rem;` +
          `padding-top: ${pt}rem;` +
          `margin-bottom: ${mb}rem;` +
          `margin-top: ${mt}rem;`
        );
      },
      pagesData() {
        return this.pages.map(page => {
          const {type, num} = page;
          return {
            type,
            num,
            value: type === 'null'? '...': num + 1,
          };
        })
      }
    },
    methods: {
      clickButton(page) {
        if(page.type === 'null') return;
        this.$emit('click-button', page.num);
      },
    }
  }
</script>
