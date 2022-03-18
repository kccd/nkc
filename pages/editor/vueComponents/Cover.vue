<template lang="pug">
.cover
  .editor-header 封面图
    small （如未指定，默认从内容中选取）
  .editor-cover
    .editor-cover-default(v-if="!cover && !coverUrl" @click="selectCover")
      .fa.fa-plus
    div(v-else)
      .editor-cover-img
        img(:src="coverUrl" v-if="coverUrl")
        img(:src="getUrl('postCover', cover)" v-else-if="cover")
      .m-t-05
        button.btn.btn-default.btn-sm(@click="selectCover") 重新选择
        button.btn.btn-default.btn-sm(@click="removeCover") 删除
  resource-selector(ref="resourceSelector")
  image-selector(ref="imageSelector")
</template>

<script>
import ResourceSelector from "../../lib/vue/ResourceSelector";
import ImageSelector from "../../lib/vue/ImageSelector";
import {blobToFile, fileToBase64} from "../../lib/js/file";

export default {
  data: () => ({
    cover: "",
    coverUrl: "",
    type: "newThread"
  }),
  components: {
    'resource-selector': ResourceSelector,
    'image-selector': ImageSelector,
  },
  methods: {
    selectCover() {
      this.$refs.resourceSelector.open(
        data => {
          let r = data.resources[0];
          let url;
          if (r.originId) {
            url = "/ro/" + r.originId;
          } else {
            url = "/r/" + r.rid;
          }
          this.$refs.imageSelector
            .open({
              aspectRatio: 3 / 2,
              url
            })
            .then(res => {
              this.coverData = res;
              fileToBase64(res)
                .then(res => {
                  this.coverUrl = res;
                })
                .catch(err => {
                  sweetError(err);
                });
              this.$refs.imageSelector.close();
            })
            .then(() => {
              this.$refs.resourceSelector.close();
            })
            .catch(err => {
              console.log(err);
              sweetError(err);
            });
        },
        {
          allowedExt: ["picture"],
          countLimit: 1
        }
      );
    },
    removeCover() {
      this.cover = "";
      this.coverData = "";
      this.coverUrl = "";
    },
    getData(){
      return {
        cover: this.cover,
      }
    }
  }
};
</script>

<style></style>
