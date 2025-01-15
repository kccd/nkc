<template lang="pug">
.container-fluid.max-width.moment-rich-editor-container
  .m-b-1(v-if='isEditMoment')
    span 正在编辑电文：
    router-link(:to='editMomentUrl', target='_blank') D{{ did }}
  .m-b-1(v-else) 正在编写新电文：
  .permission-checker
      publish-permission-checker(:type="publishPermissionTypes.moment")
  moment-rich-editor(:id='queryMomentId')
</template>

<script>
import MomentRichEditor from '../MomentRichEditor.vue';
import { getUrl } from '../../../js/tools';
import { publishPermissionTypes } from '../../../js/publish';
import PublishPermissionChecker from '../../PublishPermissionCheck.vue';

export default {
  components: {
    'moment-rich-editor': MomentRichEditor,
    'publish-permission-checker': PublishPermissionChecker,
  },
  data: () => ({
    publishPermissionTypes,
  }),
  computed: {
    editMomentUrl() {
      return getUrl('zoneMoment', this.queryMomentId);
    },
    did() {
      return this.$route.query.did || this.queryMomentId;
    },
    queryMomentId() {
      return this.$route.query.id || '';
    },
    isEditMoment() {
      return !!this.queryMomentId;
    },
  },
};
</script>

<style lang="less" scoped>
@import '../../../../publicModules/base';
.moment-rich-editor-container {
  width: 70rem;
  max-width: 100%;
  padding: 2rem;
  background-color: #fff;
  @media (max-width: 768px) {
    padding: 1rem;
  }
}
</style>