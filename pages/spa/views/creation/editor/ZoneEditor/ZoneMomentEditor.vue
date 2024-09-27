<template lang="pug">
  .zone-moment-editor
    .standard-fluid-container
      moment-editor(@published="onPublished")
</template>

<script>
  import MomentEditor from '../../../../../lib/vue/zone/MomentEditor';
  import {visitUrl} from "../../../../../lib/js/pageSwitch";

  export default {
    components: {
      'moment-editor': MomentEditor
    },
    data: () => ({

    }),
    methods: {
      onPublished(res) {
        visitUrl(`/z/m/${res.momentId}`)
      }
    }
}
</script>
