<template lang="pug">
  .zone-moment-editor
    .standard-fluid-max-container
      .permission-checker
        publish-permission-checker(:type="publishPermissionTypes.moment")
      moment-rich-editor(id="")
</template>

<script>
import { publishPermissionTypes } from '../../../../../lib/js/publish';
import PublishPermissionChecker from '../../../../../lib/vue/PublishPermissionCheck.vue';
import MomentRichEditor from '../../../../../lib/vue/zone/MomentRichEditor.vue'
export default {
  components: {
    "moment-rich-editor": MomentRichEditor,
    'publish-permission-checker': PublishPermissionChecker,
  },
  data: () => ({
    publishPermissionTypes,
  }),
}
</script>
