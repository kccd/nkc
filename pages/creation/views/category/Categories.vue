<template lang="pug">
  .category-container
    h2 资源管理
    resource-category(ref="resourceCategory")
</template>

<script>
import ResourceCategory from "../../../lib/vue/ResourceCategory";
export default {
  data: () => ({
  }),
  components: {
    'resource-category': ResourceCategory,
  },
  methods: {

  }
}
</script>
