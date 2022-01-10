<template lang="pug">
  div
    h2 草稿箱
    drafts-box(ref="draftsBox")
</template>

<script>
import DraftsBox from "../../../lib/vue/drafts/CustomDraftsBox";
export default {
  data: () => ({
  }),
  components: {
    'drafts-box': DraftsBox
  },
  mounted() {
  },
  methods: {
  }
}
</script>
