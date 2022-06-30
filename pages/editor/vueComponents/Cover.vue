<template lang="pug">
.cover
  .editor-header 封面图
    small （如未指定，默认从内容中选取）
  .editor-cover
    .editor-cover-default(v-if="!cover && !coverUrl" @click="selectCover")
      .fa.fa-plus
    div(v-else)
      .editor-cover-img
        img(:src="setUrl" v-if="url || coverUrl")
        //- img(:src="getUrl('postCover', cover)" v-else-if="cover")
      .m-t-05
        button.btn.btn-default.btn-sm(@click="selectCover") 重新选择
        button.btn.btn-default.btn-sm(@click="removeCover") 删除
  resource-selector(ref="resourceSelector")
  image-selector(ref="imageSelector")
</template>

<script>
import { debounce, immediateDebounce } from '../../lib/js/execution';

import ResourceSelector from "../../lib/vue/ResourceSelector";
import ImageSelector from "../../lib/vue/ImageSelector";
import { fileToBase64 } from "../../lib/js/file";
import { getUrl } from "../../lib/js/tools";
export default {
  data: () => ({
    // 值用来转为路径
    cover: "",
    // base64
    coverUrl: "",
    // 图片对象
    coverData: "",
    // 路径
    url: '',
    type: "newThread",
    changeContentDebounce: ''
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
    this.changeContentDebounce = immediateDebounce(this.changeContent, 2000);
  },
  watch: {
    value: {
      immediate: true,
      handler(n) {
        if (!(typeof this.value === "undefined"))
          this.url = getUrl("postCover", n);
          this.cover = n;
      }
    },
    coverUrl() {
      this.changeContentDebounce()
    }
  },
  computed: {
    setUrl() {
      return this.url || this.coverUrl
    }
  },
  methods: {
    changeContent() {
      // this.$emit('info-change');
      this.$emit('info-change')
    },
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
                  this.url = '';
                  this.cover = '';
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
      this.url = "";
      this.cover = "";
      this.coverData = "";
      this.coverUrl = "";
    },
    setCover(v) {
      this.url = getUrl("postCover", v);
      this.cover = v;
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
  .btn {
      display: inline-block;
      padding: 6px 12px;
      margin-bottom: 0;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.42857143;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      -ms-touch-action: manipulation;
      touch-action: manipulation;
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      background-image: none;
      border: 1px solid transparent;
      border-radius: 4px;
  }
.btn-sm, .btn-group-sm > .btn {
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
  margin: 0 0.8rem 0.8rem 0;
}
.btn-default {
    color: #333;
    background-color: #fff;
    border-color: #ccc;
}
.module-dialog-body{
  margin: 0;
}
.editor-cover-img {
  height: 12rem;
  width: 18rem;
}
.editor-cover-img img {
  height: 100%;
}
.editor-cover-default .fa {
  height: 12rem;
  cursor: pointer;
  width: 18rem;
  line-height: 12rem;
  text-align: center;
  color: #aaa;
  font-size: 1.5rem;
  background-color: #eee;
}
.editor-header {
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small {
  color: #88919d;
}
</style>
