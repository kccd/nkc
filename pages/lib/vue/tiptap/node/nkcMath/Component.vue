<template>
  <node-view-wrapper
    :class="{ 'node-view-wrapper': true, 'node-view-wrapper-block': block }"
    title="点击编辑公式"
  >
    <span class="nkc-math-option-container" v-if="isFocused">
      <span class="m-r-05" title="编辑" @mouseup.stop="openMathEditor">
        <write-icon theme="outline" size="12" fill="#333" />
      </span>
      <span title="删除" @mouseup="deleteNode">
        <delete-icon theme="outline" size="12" fill="#333" />
      </span>
    </span>
    <span
      class="nkc-math-html-container"
      :key="formula"
      ref="mathContainer"
      @click="selectMath"
      >{{ formula }}</span
    >
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { Delete, Write } from '@icon-park/vue';

export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'delete-icon': Delete,
    'write-icon': Write,
  },
  props: nodeViewProps,
  data: () => ({
    mathHTML: '',
    isFocused: false,
  }),
  computed: {
    text() {
      return this.node.attrs.text;
    },
    block() {
      return this.node.attrs.block;
    },
    formula() {
      if (this.block) {
        return `$$${this.text}$$`;
      } else {
        return `$${this.text}$`;
      }
    },
  },
  mounted() {
    this.renderMathHTML();
    window.addEventListener('mouseup', this.cancelFocus);
  },
  beforeDestroy() {
    window.removeEventListener('mouseup', this.cancelFocus);
  },
  watch: {
    formula() {
      setTimeout(() => {
        this.renderMathHTML();
      }, 10);
    },
  },
  methods: {
    selectMath() {
      this.isFocused = true;
    },
    cancelFocus() {
      this.isFocused = false;
    },
    renderMathHTML() {
      window.MathJax.typeset([this.$refs.mathContainer]);
    },
    openMathEditor() {
      this.editor.commands.openMathSelector(
        (res) => {
          const { text, block } = res;
          this.updateAttributes({
            block,
            text,
          });
          // this.node.attrs.block = block;
          // this.node.attrs.text = text;
        },
        {
          text: this.text,
          block: this.block,
        },
      );
    },
  },
};
</script>

<style scoped lang="less">
.node-view-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
  &.node-view-wrapper-block {
    display: block;
  }
  & > span.nkc-math-option-container {
    position: absolute;
    top: -1.4rem;
    right: 0;
    display: flex;
    justify-content: flex-end;
    span {
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e9e9e9;
      border-radius: 3px;
      &:hover,
      &:active {
        opacity: 0.7;
      }
    }
  }
  & > span.nkc-math-html-container {
    ::v-deep {
      .MathJax {
        font-size: inherit !important;
      }
    }
  }
}
.ProseMirror-selectednode {
  outline: 1px solid #66afe9;
}
</style>
