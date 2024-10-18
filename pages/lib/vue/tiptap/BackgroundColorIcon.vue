<template lang="pug">
  div.tiptap-text-color-icon
    <high-light theme="outline" size="14" />
    div(:style="`background-color: ${color}`")
</template>

<script>
import {HighLight} from '@icon-park/vue'
export default {
  components: {
    'high-light': HighLight,
  },
  data: () => ({

  }),
  props: ['color']
}
</script>

<style scoped lang="less">
.tiptap-text-color-icon{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -4px;
  width: 100%;
  &>div{
    margin-top: -0.3rem;
    height: 0.3rem;
    width: 1.5rem;
  }
}
</style>
