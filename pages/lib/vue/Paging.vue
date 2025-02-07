<template lang="pug">
  .paging(v-if="pagesData.length" :style="containerStyle")
    span.paging-button(
      v-for="b in pagesData"
      :class="b.type"
      @click="clickButton(b)"
      ) {{b.value}}
    input(v-model.number="page" type="text" placeholder='页码')
    span.paging-button.common(@click="skipPage" :class="{'disabled': disableSkipButton}") 跳转
</template>

<style lang="less" scoped>
@import '../../publicModules/base';
.paging {
  display: inline-block;
  input {
    font-size: 1.15rem;
    width: 4rem;
    margin: 0 0.3rem 0 0;
    outline: none;
    border: 1px solid #888888;
    border-radius: 2px;
  }
  span {
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
    &.active {
      background-color: @primary;
    }
    &.null {
      color: #555;
      padding: 0 0.2rem;
      margin-top: 0;
      margin-bottom: 0;
    }
    &.common {
      background-color: @darkGray;
    }
    &:hover {
      opacity: 0.7;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
  & span:last-child {
    margin-right: 0;
  }
}
</style>

<script>
export default {
  props: ['pages', 'pb', 'pt', 'mb', 'mt'],
  data: () => ({
    page: '',
  }),
  computed: {
    disableSkipButton() {
      return this.page === '' || this.page === undefined || this.page < 1;
    },
    containerStyle() {
      const { pb = 0, pt = 0, mb = 0, mt = 0 } = this;
      return (
        `padding-bottom: ${pb}rem;` +
        `padding-top: ${pt}rem;` +
        `margin-bottom: ${mb}rem;` +
        `margin-top: ${mt}rem;`
      );
    },
    pagesData() {
      return this.pages.map((page) => {
        const { type, num } = page;
        return {
          type,
          num,
          value: type === 'null' ? '...' : num + 1,
        };
      });
    },
  },
  methods: {
    emitEvent(num) {
      this.$emit('click-button', num);
    },
    clickButton(page) {
      if (page.type === 'null') return;
      this.emitEvent(page.num);
    },
    skipPage() {
      if (this.disableSkipButton) return;
      this.emitEvent(this.page - 1);
    },
  },
};
</script>
