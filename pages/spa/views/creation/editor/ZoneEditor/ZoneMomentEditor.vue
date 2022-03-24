<template lang="pug">
  .zone-moment-editor
    .standard-container.p-t-3
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
      onPublished() {
        visitUrl('/g/moment')
      }
    }
}
</script>
