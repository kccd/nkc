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
        //- img(:src="getUrl('postCover', cover)" v-else-if="cover")
      .m-t-05
        button.btn.btn-default.btn-sm(@click="selectCover") 重新选择
        button.btn.btn-default.btn-sm(@click="removeCover") 删除
  resource-selector(ref="resourceSelector")
  image-selector(ref="imageSelector")
</template>

<script>
import ResourceSelector from "../../lib/vue/ResourceSelector";
import ImageSelector from "../../lib/vue/ImageSelector";
import { fileToBase64 } from "../../lib/js/file";
import { getUrl } from "../../lib/js/tools";
export default {
  data: () => ({
    cover: "",
    coverUrl: "",
    type: "newThread",
    coverData: ''
  }),
  components: {
    "resource-selector": ResourceSelector,
    "image-selector": ImageSelector
  },
  props: {
    value: {
      type: String
    }
  },
  created() {
    if(typeof this.value === 'undefined') {
      console.error('this.value is undefined');
      return
    } 

    this.coverUrl = getUrl("postCover", this.value);
    
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
    getData() {
      return {
        cover: this.cover,
        coverData: this.coverData,
        coverUrl: this.coverUrl
      };
    }
  }
};
</script>

<style lang="less" scoped>

.editor-cover-img{
  height: 12rem;
  width: 18rem;
}
.editor-cover-img img{
  height: 100%;
}
.editor-cover-default .fa{
  height: 12rem;
  cursor: pointer;
  width: 18rem;
  line-height: 12rem;
  text-align: center;
  color: #aaa;
  font-size: 1.5rem;
  background-color: #eee;
}
.editor-header{
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small{
  color: #88919d;
}
</style>
