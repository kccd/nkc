<template lang="pug">
  .modal-is-content
    .modal-is-header(ref="draggableHandle")
      .modal-is-title 图片选择
      .modal-is-close(@click="close")
        .fa.fa-remove
    .modal-is-body
      input(type="file" accept="image/*" ref="file" @change="selectedFile")
      .image-container
        img(ref="image")
    .modal-is-footer
      .pull-left
        button(type="button" class="btn btn-default btn-sm" @click="rotate('left')") 左旋
        button(type="button" class="btn btn-default btn-sm" @click="rotate('right')") 右旋
      button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
      button(type="button" class="btn btn-primary btn-sm" @click="submit") 确定
</template>

<style lang="less">
@import "../../publicModules/base";
.modal-is-content {
  display: none;
  position: fixed;
  width: 46rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .modal-is-header {
    @height: 3rem;
    height: @height;
    background-color: #f6f6f6;
    position: relative;

    .modal-is-title {
      cursor: move;
      height: @height;
      line-height: @height;
      color: #666;
      padding-left: 1rem;
    }

    .modal-is-close {
      position: absolute;
      right: 0;
      top: 0;
      height: @height;
      width: @height;
      text-align: center;
      cursor: pointer;
      line-height: @height;
      color: #888;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }
  }
  .modal-is-body {
    padding: 0.5rem 1rem 0.5rem 1rem;

    .image-container {
      margin-top: 1rem;

      img {
        max-width: 100%;
        max-height: 30rem;
      }
    }
  }
  .modal-is-footer{
    text-align: right;
    height: 3rem;
    margin-top: 1rem;
    button{
      margin-right: 0.5rem;
    }
    .pull-left {
      margin-left: 0.5rem;
      float: left;
    }
  }
}

</style>

<script>
  import {fileToBase64} from "../js/file";
  import 'cropperjs/dist/cropper.css';
  import {DraggableElement} from "../js/draggable";
  import Cropper from 'cropperjs';
  export default {
    data: () => ({
      draggableElement: null,
      init: false,
      cropper: null,
      resolve: null,
      reject: null,
      fileBase64: '',
      file: null,
    }),
    mounted() {
      this.initDraggableElement();
    },
    destroyed() {
      this.destroyCropper();
      this.destroyDraggable();
    },
    methods: {
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle)
      },
      initModal() {
        if(this.init === true) return;
        const image = this.$refs.image;
        this.cropper = new Cropper(image, {
          aspectRatio: 1,
        });
        this.init = true;
      },
      destroyDraggable() {
      },
      destroyCropper() {
        if(!this.cropper || !this.cropper.destroy) return;
        this.cropper.destroy();
      },
      resetCropperImage() {
        this.cropper.replace(this.fileBase64);
      },
      selectedFile() {
        const self = this;
        const file = this.$refs.file.files[0];
        fileToBase64(file)
          .then(fileBase64 => {
            self.fileBase64 = fileBase64;
            self.file = file;
            self.resetCropperImage();
          })
      },
      open(options = {}) {
        const self = this;
        return new Promise((resolve, reject) => {
          self.initModal();
          const {aspectRatio = 1} = options;
          self.cropper.setAspectRatio(aspectRatio);
          self.resolve = resolve;
          self.reject = reject;
          self.draggableElement.show();
        });
      },
      close() {
        this.draggableElement.hide();
      },
      rotate(direction) {
        if(direction === "left") {
          this.cropper.rotate(-90);
        } else {
          this.cropper.rotate(90);
        }
      },
      submit() {
        const {resolve, reject} = this;
        if(!resolve) return;
        try{
          this.cropper.getCroppedCanvas().toBlob(blob => {
            this.resolve(blob);
          });
        } catch(err) {
          reject(err);
        }
      }
    }
  }
</script>


