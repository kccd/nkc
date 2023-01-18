<template lang="pug">
  .modal-is-content
    .modal-is-header
      .modal-is-title(ref="draggableHandle") 图片选择
      .modal-is-close(@click="close")
        .fa.fa-remove
    .modal-is-body
      input(type="file" accept="image/*" ref="file" @change="selectedFile")
      .image-container
        img(ref="image")
        .loading(v-if="loading")
          img(ref="image" v-show="false")
          .fa.fa-spinner.fa-spin.fa-fw
          .loading-text 加载中...
    .modal-is-footer
      .pull-left
        button(type="button" class="btn btn-default btn-sm" @click="rotate('left')" :disabled="disabled") 左旋
        button(type="button" class="btn btn-default btn-sm" @click="rotate('right')" :disabled="disabled") 右旋
      span.doing-info.m-r-1(v-if="progress") 图片处理中...
      button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
      button(type="button" class="btn btn-primary btn-sm" @click="submit" :disabled="disabled") 确定
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
    padding-right: @height;
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
    .loading{
      text-align: center;
      .fa{
        font-size: 1.7rem;
        margin-bottom: 0.2rem;
      }
      .loading-text{
        font-size: 1.2rem;
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
      disabled: true,
      loading: false,
      progress: false,
      imgInfo:{},
      reduction:[0,180,-180],
      minContainerHeight:400
    }),
    mounted() {
      this.initDraggableElement();
    },
    destroyed() {
      this.destroyCropper();
      this.destroyDraggable();
      this.draggableElement && this.draggableElement.destroy();
    },
    methods: {
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
        this.draggableElement.setPositionCenter();

      },
      initModal() {
        if(this.init === true) return;
        const image = this.$refs.image;
        this.cropper = new Cropper(image, {
          viewMode: 0,
          aspectRatio: 1,
          minContainerHeight:this.minContainerHeight,
          crop:(e)=>{
          if(image.height > image.width){
            this.imgInfo.radio = image.width / image.height
            this.imgInfo.max = 'height'
            this.imgInfo.value = image.height
          }else if(image.height < image.width){
            this.imgInfo.radio = image.width / image.height
            this.imgInfo.max = 'width'
            this.imgInfo.value = image.width
            // 宽没占满高也未占满
          }else{
            this.imgInfo={}
          }
          //- 如果宽大于高  旋转后 w 408（容器h）
          //- 如果高大于宽  旋转后 h 408（容器h）
          // 对比旋转前的 高 和 宽 小了多少
          // 然后 根据比率 来缩小 scale
          this.rotateValue = e.detail.rotate
        }

        });
        this.init = true;
      },
      destroyDraggable() {
      },
      destroyCropper() {
        if(!this.cropper || !this.cropper.destroy) return;
        this.cropper.destroy();
      },
      resetCropperImage(url) {
        url = url || this.fileBase64;
        this.cropper.replace(url);
      },
      selectedFile() {
        this.loading = true;
        const self = this;
        const file = this.$refs.file.files[0];
        // console.dir(file)
        fileToBase64(file)
          .then(fileBase64 => {
            self.fileBase64 = fileBase64;
            self.file = file;
            self.resetCropperImage();
            self.loading = false;
            self.disabled = false;
          })
      },
      open(options = {}) {
        const self = this;
        return new Promise((resolve, reject) => {
          self.initModal();
          const {
            aspectRatio = 1,
            url = ''
          } = options;
          if(url) {
            self.resetCropperImage(url);
          }
          self.cropper.setAspectRatio(aspectRatio);
          self.resolve = resolve;
          self.reject = reject;
          self.disabled = false;
          self.draggableElement.show();
        });
      },
      close() {
        this.draggableElement.hide();
      },
      rotateZoom(originValue, nextValue){
        if(this.reduction.includes(this.rotateValue)){
          this.cropper.scale(1);
        }else{
            //- const imgWidthInCanvas = originValue;
          const scaleRadio = originValue / nextValue;
          this.cropper.scale(scaleRadio);
        }
      },
      rotate(direction) {
        const self = this;
        if(direction === "left") {
          this.cropper.rotate(-90);
        } else {
          this.cropper.rotate(90);
        }
        const imgWidthInCanvas = self.minContainerHeight * self.imgInfo.radio;
        const contaiorWidth = parseInt(document.querySelector('.cropper-container').style.width)
        if(self.imgInfo.max === 'width'){
          // 宽占满
          if(contaiorWidth <= imgWidthInCanvas){
            const nextImgWidthInCanvas = (self.minContainerHeight / contaiorWidth) * (contaiorWidth / self.imgInfo.radio)
            if(nextImgWidthInCanvas > contaiorWidth){
              this.rotateZoom(contaiorWidth, self.minContainerHeight)
            }else{
              this.rotateZoom(self.minContainerHeight, contaiorWidth)
            }
            // 高占满
          }else{
            const nextImgWidthInCanvas = (imgWidthInCanvas / self.minContainerHeight) * self.minContainerHeight
            if(nextImgWidthInCanvas > contaiorWidth){
              this.rotateZoom(imgWidthInCanvas, self.minContainerHeight)
            }else{
              this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
            }
          }
        }else if(self.imgInfo.max === 'height'){
          // 宽占满
          if(contaiorWidth <= imgWidthInCanvas){
            this.rotateZoom(self.minContainerHeight, contaiorWidth)
          }else{
            // 高占满
            const nextImgHeightInCanvas = (contaiorWidth / self.minContainerHeight) * (imgWidthInCanvas)
          //- 如果旋转后的高 大于容器高 那么以容器高来显示图片
          // 山峰图 oip-c.jpg
            if(nextImgHeightInCanvas > self.minContainerHeight){
              this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
            }else{
              this.rotateZoom(contaiorWidth, self.minContainerHeight)
            }
          }
        }
      },
      submit() {
        const {resolve, reject} = this;
        if(!resolve) return;
        this.progress = true;
        try{
          this.cropper.getCroppedCanvas().toBlob(blob => {
            this.resolve(blob);
            this.progress = false;
          });
        } catch(err) {
          reject(err);
        }
      }
    }
  }
</script>


