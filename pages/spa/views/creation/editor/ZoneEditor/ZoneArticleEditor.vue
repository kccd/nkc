<template lang="pug">
  .zone-moment-editor
    .standard-fluid-max-container
      moment-rich-editor(id="")
</template>

<script>
import MomentRichEditor from '../../../../../lib/vue/zone/MomentRichEditor.vue'
export default {
  components: {
    "moment-rich-editor": MomentRichEditor,
  },
}
</script>
