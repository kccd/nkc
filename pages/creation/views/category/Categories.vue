<template lang="pug">
  .container-fluid.category-container
    h2 资源管理
    resource-selector-core(ref="resourceSelectorCore")
</template>

<script>
import ResourceSelectorCore from "../../../lib/vue/ResourceSelectorCore";
export default {
  data: () => ({
  }),
  components: {
    'resource-selector-core': ResourceSelectorCore,
  },
  methods: {

  }
}
</script>
