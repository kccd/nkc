<template lang="pug">
  .modal.fade.image-selector(ref="imageSelector" tabindex="-1" role="dialog")
    .modal-dialog(role="document")
      .modal-content
        .modal-header
          button.close(data-dismiss="modal" aria-label="Close")
            span(aria-hidden="true") &times;
          h4.modal-title 图片选择
        .modal-body
          input(type="file" accept="image/*" ref="file" @change="selectedFile")
          .image-container
            img(ref="image")
        .modal-footer
          button(type="button" class="btn btn-default btn-sm" @click="rotate('left')") 左旋
          button(type="button" class="btn btn-default btn-sm" @click="rotate('right')") 右旋
          button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
          button(type="button" class="btn btn-primary btn-sm" @click="submit") 确定
</template>

<script>
  import {fileToBase64} from "../js/file";
  import 'cropperjs/dist/cropper.css';
  import Cropper from 'cropperjs';
  export default {
    data: () => ({
      init: false,
      cropper: null,
      resolve: null,
      reject: null,
      fileBase64: '',
      file: null,
      root: null,
    }),
    destroyed() {
      this.destroyCropper();
      this.destroyDraggable();
    },
    methods: {
      initModal() {
        if(this.init === true) return;
        const root = $(this.$refs.imageSelector);
        const image = this.$refs.image;
        root.modal({
          show: false,
          backdrop: "static"
        });
        this.cropper = new Cropper(image, {
          aspectRatio: 1,
        });
        this.root = root;
        this.init = true;
      },
      destroyDraggable() {
        if(this.root && this.root.draggable) this.root.draggable('destroy');
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
          this.root.modal('show');
          const {aspectRatio = 1} = options;
          self.cropper.setAspectRatio(aspectRatio);
          self.resolve = resolve;
          self.reject = reject;
        });
      },
      close() {
        this.root.modal('hide');
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

<style lang="less" scoped>
  .image-container{
    margin-top: 1rem;
    img{
      max-width: 100%;
      max-height: 30rem;
    }
  }
</style>