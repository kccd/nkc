<template lang="pug">
  .container-fluid.category-container
    h2 资源管理
    resource-category(ref="resourceCategory")
</template>

<script>
import ResourceSelector from "../../../lib/vue/ResourceSelector";
export default {
  data: () => ({
  }),
  components: {
    'resource-category': ResourceSelector,
  },
  methods: {

  }
}
</script>
