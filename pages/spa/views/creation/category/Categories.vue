<template lang="pug">
  .category-container.standard-max-container
    h2 资源管理
    resource-selector-core(ref="resourceSelectorCore" watch-type="category")
</template>

<script>
import ResourceSelectorCore from "../../../../lib/vue/ResourceSelectorCore";
export default {
  data: () => ({
  }),
  components: {
    'resource-selector-core': ResourceSelectorCore,
  },
  mounted() {
  },
  methods: {
  }
}
</script>
