<template lang="pug">
  .zone-moment-editor
    .standard-container.p-t-3
      moment-editor
</template>

<script>
  import MomentEditor from '../../../../lib/vue/MomentEditor';
  export default {
    components: {
      'moment-editor': MomentEditor
    },
    data: () => ({

    })
}
</script>