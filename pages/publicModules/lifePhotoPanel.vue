<template lang="pug">
  .life-photo-panel
    .header
      span 我的照片 {{lifePhotos.length}} / 16
      input.hidden(type='file' ref="fileInput" @change="selectedFile" multiple="multiple")
      .pull-right
        button.btn.btn-xs.btn-default.m-r-05(@click="changeStatus") 编辑
        button.btn.btn-xs.btn-default(@click="selectFile") 上传

    .photos
      .photo(v-for="p in lifePhotos" @click="selectPhoto(p)")
        .btn-remove(@click="removePhoto(p)" title="删除照片" v-if='editPhoto') 删除
        img(:src="getUrl('lifePhotoSM', p._id)")
      .info.p-t-2.p-b-2.text-center(v-if="lifePhotos.length === 0") 空空如也~
</template>

<style lang="less" scoped>
  .life-photo-panel{
    background-color: #f4f4f4;
  }
  .header{
    padding: 0 1rem;
    font-size: 1.25rem;
    height: 3rem;
    line-height: 3rem;
    text-align: left;
    background-color: #f0f0f0;
    span{
      margin-right: 0.5rem;
    }
  }
  .photos{
    font-size: 0;
    padding: 0.5rem;
    .info{
      font-size: 1.25rem;
    }
    .photo{
      background-color: rgba(0, 0, 0, 1);
      vertical-align:  top;
      cursor: pointer;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      display: inline-block;
      height: 7rem;
      width: 10rem;
      position: relative;
      z-index: 10;
      img{
        max-height: 100%;
        max-width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
      }
      .btn-remove{
        position: absolute;
        top: 0;
        right: 0;
        z-index: 20;
        height: 100%;
        width: 100%;
        line-height: 100%;
        font-size: 1.25rem;
        text-align: right;
        cursor: pointer;
        color: #f0f0f0;
        padding: 0.5rem;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }
</style>

<script>
  export default {
    props: ['uid'],
    data: () => ({
      lifePhotos: [],
      editPhoto: false,
    }),
    mounted() {
      this.getPhotos();
    },
    methods: {
      getUrl: NKC.methods.tools.getUrl,
      getPhotos() {
        const self = this;
        nkcAPI(`/me/life_photos`, 'GET')
        .then(data => {
          self.lifePhotos = data.lifePhotos;
        })
        .catch(sweetError)
      },
      selectFile() {
        this.editPhoto = false;
        this.$refs.fileInput.click();
      },
      selectedFile() {
        const files = this.$refs.fileInput.files;
        if(files.length) {
          screenTopAlert(`文件上传中...`);
          this.uploadFile(files, 0);
        }
      },
      uploadFile(files, index) {
        const file = files[index];
        if(!file) {
          this.getPhotos();
          return screenTopAlert(`上传完成`);
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('photoType', 'life');
        const self = this;
        nkcUploadFile(`/photo`, 'POST', formData)
          .then(() => {
            self.uploadFile(files, index + 1)
          })
          .catch(err => {
            sweetError(err);
            self.uploadFile(files, index + 1)
          });
      },
      removePhoto(photo) {
        const self = this;
        sweetQuestion(`确定要删除当前照片？`)
        .then(() => {
          return nkcAPI(`/photo/${photo._id}`, 'DELETE')
        })
        .then(() => {
          const index = self.lifePhotos.indexOf(photo);
          if(index !== -1) self.lifePhotos.splice(index, 1);
        })
        .catch(sweetError);
      },
      changeStatus() {
        this.editPhoto = !this.editPhoto;
      },
      selectPhoto(photo) {
        this.$emit('selectphoto', photo);
      }
    }
  }
</script>