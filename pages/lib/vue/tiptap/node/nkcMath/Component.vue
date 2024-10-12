<template>
  <node-view-wrapper class="node-view-wrapper" title='点击编辑公式'>
    <math-selector ref="mathSelector"></math-selector>
    <span v-html="mathHTML" @click="openMathEditor"></span>
  </node-view-wrapper>

</template>

<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import MathSelector from "../../../MathSelector.vue";

export default {
  components: {
    'node-view-wrapper': NodeViewWrapper,
    'math-selector': MathSelector,
  },
  props: nodeViewProps,
  data: () => ({
    mathHTML: '',
  }),
  computed: {
    text() {
      return this.node.attrs.text;
    },
    block() {
      return this.node.attrs.block;
    },
  },
  watch: {
    text() {
      this.renderMathHTML();
    },
    block() {
      this.renderMathHTML();
    }
  },
  mounted() {
    this.renderMathHTML();
  },
  methods: {
    renderMathHTML() {
      MathJax.typesetPromise()
      .then(() => {
        return MathJax.tex2chtmlPromise(this.text, {
          display: this.block,
        })
      })
      .then(html => {
        this.mathHTML = html.outerHTML;
      })
    },
    openMathEditor() {
      this.$refs.mathSelector.open(res => {
        const {text, block} = res;
        this.node.attrs.block = block;
        this.node.attrs.text = text;
      }, {
        text: this.node.attrs.text,
      });
    }
  }
}
</script>

<style scoped lang="less">
.node-view-wrapper{
  display: inline;
  cursor: pointer;
}
</style>