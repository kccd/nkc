<template lang="pug">
  .resource-category-container
    image-viewer(ref="imageViewer")
    resource-info(ref="resourceInfo")
    common-modal(ref="categoryModal")
    select-category(ref="selectCategory" @edit-category="editResourceCategory" :categories="categories" @order-change="getResourcesDebounce(0)")
    mixin resourcePaging
      .resource-paging(v-if="paging && paging.buttonValue")
        .paging-button(v-if="paging.buttonValue.length > 1")
          a.button.radius-left(title="上一页" @click="changePage('last')")
            .fa.fa-angle-left
          a.button.radius-right(title="下一页" @click="changePage('next')")
            .fa.fa-angle-right
        .paging-button(v-if="screenType !== 'sm'")
          span(v-for="(b, index) in paging.buttonValue")
            span(v-if="b.type === 'active'")
              a.button.active(@click="getResourcesDebounce(b.num)"
                :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
              ) {{b.num+1}}
            span(v-else-if="b.type === 'common'")
              a.button(@click="getResourcesDebounce(b.num)"
                :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
              ) {{b.num+1}}
            span(v-else)
              a.button ..
        .paging-button(v-if="paging.buttonValue.length")
          span(style="font-size: 1rem;") 跳转到&nbsp;
          input.input.radius-left(type="text" v-model.number="pageNumber")
          a.button.radius-right(@click="fastSelectPage") 确定
    .resource-container-header(v-if="pageType !== 'editPicture'")
      .resource-categories
        .categoryName(:class="{'active': resourceCategories === 'all'}" @click="selectUserCategory('all')")
          span 全部
          span(v-if="count.allCount !== 0") ({{count.allCount}})
        .categoryName(:class="{'active': resourceCategories === 'trash'}" v-if="watchType === 'category'" @click="selectUserCategory('trash')")
          span 回收站
          span(v-if="count.trashCount !== 0") ({{count.trashCount}})
        .categoryName(:class="{'active':resourceCategories === 'default'}" @click="selectUserCategory('default')")
          span 未分组
          span(v-if="count.ungroupedCount !== 0") ({{count.ungroupedCount}})
      .fa.fa-spinner.fa-spin.fa-fw(v-if="categoryLoading")
      .resource-categories(v-else v-for="c in categories")
        .categoryName(:class="{'active':resourceCategories === c._id}"
          :title="'创建时间: ' + timeFormat(c.toc) + '\\n分组名: '+ c.name"
          @click="selectUserCategory(c._id)")
          span {{c.name}}
          span(v-if="c.count !== 0") ({{c.count}})
      button.m-r-05.btn.btn-default.btn-xs(@click="editResourceCategory('', 'create')" v-if="watchType === 'category'") 创建分组
      button.btn.btn-default.btn-xs(@click="editCategory" v-if="watchType === 'category'") 管理分组
    .resource-category-content(v-if="pageType === 'list'")
      .resource-category-header
        .selected-resources
          .resource-types
            .resource-type(v-if="show.all" :class="{'active':resourceType === 'all'}" @click="selectResourceType('all')") 全部
            .resource-type(v-if="show.picture" :class="{'active':resourceType === 'picture'}" @click="selectResourceType('picture')") 图片
            .resource-type(v-if="show.video" :class="{'active':resourceType === 'video'}" @click="selectResourceType('video')") 视频
            .resource-type(v-if="show.audio" :class="{'active':resourceType === 'audio'}" @click="selectResourceType('audio')") 音频
            .resource-type(v-if="show.attachment" :class="{'active':resourceType === 'attachment'}" @click="selectResourceType('attachment')") 附件
          .resource-types
            .resource-type(:class="{'active':category === 'all'}" @click="selectCategory('all')") 全部
            .resource-type(:class="{'active':category === 'unused'}" @click="selectCategory('unused')") 未使用
            .resource-type(:class="{'active':category === 'used'}" @click="selectCategory('used')") 已使用
            .resource-type(v-if="files.length" :class="{'active':category === 'upload'}" @click="selectCategory('upload')") 正在上传
        .resource-upload
          input.hidden(ref='inputElement' type="file" multiple="true" @change="selectedFiles")
          button.btn.btn-default.btn-sm.m-r-05(@click="clickInput" v-if="watchType === 'category' && isApp") 上传文件
          button.btn.btn-default.btn-sm.m-r-05(@click="selectAllResources" v-if="watchType === 'category' && selectedResources.length") 全选
          button.btn.btn-default.btn-sm.m-r-05(@click="delResource('', 'delete')" v-if="watchType === 'category' && selectedResources.length && resourceCategories !== 'trash'") 移动到回收站
          button.btn.btn-default.btn-sm.m-r-05(@click="delResource('', 'trash')" v-if="watchType === 'category' && selectedResources.length && resourceCategories === 'trash'") 恢复选中
          button.btn.btn-default.btn-sm(@click="moveToCategory" v-if="watchType === 'category' && selectedResources.length && resourceCategories !== 'trash'") 移动到分组
      .resources-paging(v-if="category !== 'upload'")
        +resourcePaging
      .resources-body(v-if="category === 'upload'")
        .resource-info(v-if="!files.length") 空空如也~
        .resource-padding-container(v-else v-for="(f, index) in files")
          .resource(:class="watchType === 'select'?'resource-select':'resource-category'")
            .resource-upload-body(v-if="f.status === 'uploading'")
              .resource-picture.upload(v-if="f.progress !== 100" :class="{'uploadSelect': watchType === 'select'}")
                span 上传中..{{f.progress}}%
                .fa.fa-spinner.fa-spin.fa-fw
              .resource-picture.upload(v-else :class="{'uploadSelect': watchType === 'select'}")
                span 处理中..
                .fa.fa-spinner.fa-spin.fa-fw
            .resource-upload-body(v-if="f.status === 'unUpload'")
              .resource-picture.upload(v-if="f.error" :class="{'uploadSelect': watchType === 'select'}")
                .remove-file
                  .fa.fa-remove(@click="removeFile(index)")
                span.pointer(@click="startUpload(f)") 上传失败，点击重试
              .resource-picture.upload(v-else :class="{'uploadSelect': watchType === 'select'}")
                span 等待中...
                .fa.fa-spinner.fa-spin.fa-fw
            .resource-name
              span {{f.name}}
      .resources-body(
        v-else
        :class="watchType === 'select'?'':'min-length'")
        //-.resources-loading(v-if="loading")
          .fa.fa-spinner.fa-spin.fa-fw
          .loading-text 加载中...
        .resource-info(v-if="!resources.length") 空空如也~
        //- 资源显示
        .resource-padding-container(
          v-else
          v-for="(r, index) in resources"
          :class="watchType === 'select'?'resource-select':'resource-category'"
          )
          .resource
            span(v-if='r.state === "usable"')
              .resource-picture(v-if="r.mediaType === 'uploading'" :style="'background-image:url(/rt/' + r.rid + ')'")
              .resource-picture.media-picture(v-if="r.mediaType === 'mediaPicture'" :style="'background-image:url(' + getUrl('resourceCover', r.rid) + ')'")
              .resource-picture.media-picture(v-if="r.mediaType === 'mediaVideo'" :style="'background-image:url(' + getUrl('resourceCover', r.rid) + ')'")
              .resource-picture.icon(v-if="r.mediaType === 'mediaAudio'" :style="'background-image:url(/attachIcon/mp3.png)'")
              .resource-picture.icon(v-if="r.mediaType === 'mediaAttachment'" :style="'background-image:url(/attachIcon/'+r.ext+'.png)'")
            span(v-else)
              .resource-picture.resource-in-process-bg
            .resource-name(
              :title="'时间：'+ timeFormat(r.toc)+'\\n文件名：' + r.oname"
            )
              span(v-if="r.mediaType === 'mediaVideo'") (视频)
              span {{r.oname}}
            span(v-if='["usable", "useless"].includes(r.state)')
              .resource-options(v-if="selectedResourcesId.indexOf(r.rid) === -1")
                .resource-mask(v-if='watchType === "category" ||  r.state === "usable"' @click="fastSelectResource(r)")
                .resource-do
                  .fa.fa-edit(@click="editImage(r)" v-if="r.mediaType === 'mediaPicture' && r.state === 'usable'")
                  .fa.fa-trash-o(@click="delResource(r, 'delete')" v-if="watchType === 'category' && !r.del")
                  .fa.fa-reply(@click="delResource(r, 'trash')" v-if="watchType === 'category' && r.del")
                  .fa.fa-square-o(v-if="watchType === 'category'" @click="checkbox(r)")
                  .fa.fa-square-o(v-if="r.state === 'usable' && watchType === 'select'" @click="selectResource(r)")
              .resource-in-process.pointer(v-if="r.state === 'useless'" @click='selectedResourcesId.length === 0 && showErrorInfo(r)')
                span 处理失败
                .fa.fa-question-circle(v-if='r.errorInfo' :title='r.errorInfo' )
              .resource-options(v-if="selectedResourcesId.indexOf(r.rid) !== -1" )
                .resource-mask.active(v-if='watchType === "category" ||  r.state === "usable"' @click="fastSelectResource(r)")
                .resource-do
                  .fa.fa-check-square-o.active(v-if='watchType === "category" ||  r.state === "usable"' @click="selectResource(r)")
                .resource-index {{selectedResourcesId.indexOf(r.rid) + 1}}
            span(v-else-if='r.state === "inProcess"')
              .resource-in-process
                span 处理中..
                .fa.fa-spinner.fa-spin.fa-fw
      .module-sr-footer
        .pull-left
          input.hidden(ref='inputElement' type="file" multiple="true" @change="selectedFiles")
          button.btn.btn-default.btn-sm.m-r-05(@click="clickInput") 上传
          button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="takePicture") 拍照
          button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="takeVideo") 录像
          button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="recordAudio") 录音
          .text-left.hidden-xs.hidden-sm.paste-content(ref='pasteContent' @click="readyPaste") 拖拽或粘贴文件到此处即可上传
          span.size-limit.hidden-xs.hidden-sm(@click='showFileSizeLimit' :title='fileSizeLimit' v-if='fileSizeLimit') 大小限制
            .fa.fa-question-circle
        button(type="button" class="btn btn-primary btn-sm" v-if="!selectedResourcesId.length && watchType === 'select'" disabled title="请先勾选图片") 确定
        button(type="button" class="btn btn-primary btn-sm" @click="done" v-else-if="selectedResourcesId.length && watchType === 'select'") 确定
    .edit-picture-body(v-else-if="pageType === 'editPicture'")
      img.image(ref='imageElement')
      .module-sr-footer.m-t-1
        .pull-left
          button.btn.btn-default.btn-sm.m-r-05(@click="rotate('left')") 左旋
          button.btn.btn-default.btn-sm(@click="rotate('right')") 右旋
        button(type="button" class="m-r-05 btn btn-default btn-sm" @click="cancelCropPicture") 取消
        button(type="button" class="m-r-05 btn btn-primary btn-sm" disabled v-if="croppingPicture") 裁剪中..
          .fa.fa-spinner.fa-spin.fa-fw
        button(type="button" class="btn btn-primary btn-sm" @click="cropPicture" v-else) 确定



</template>
<style lang="less" scoped>
  @import "../../publicModules/base";
  .resource-category-container {
    user-select: none;
    .resource-container-header {
      .resource-uses {
        display: inline-block;
        padding-right: 1rem;
        border-right: 1px #ccc solid;
        margin-right: 1rem;
        .resource-used {
          display: inline-block;
          padding: 0.2rem;
          border: 1px #ccc solid;
          border-radius: 3px;
          margin: 0 0.2rem;
          //background: #9baec8;
          color: #fff;
          cursor: pointer;
          &:nth-of-type(1){
            margin-left: 0;
          }
          &:hover {
            //background: #2b90d9;
          }
        }
        .active {
          //background: #2b90d9;
        }
      }
      .categoryName {
        padding: 0 1rem 0 0;
        display: inline-block;
        position: relative;
        &:hover {
          color: @primary;
        }
        .resources-count {
        }
      }
      .resource-categories {
        display: inline-block;
        padding: 0.2rem 0.2rem 0.2rem 0;
        cursor: pointer;
        //margin-right: 0.4rem;
        .fa {
          line-height: 50%;
          display: inline-block;
          margin-left: 0.3rem;
          &:hover {
            color: orange;
          }
        }
      }
      .add-button {
        color: #fff;
        background: #337ab7;
        &:hover {
          background: #286090;
        }
      }
      .active {
        color: #2b90d9;
      }
    }
    .resource-category-content {
      .resource-category-header {
        text-align: right;
        overflow: hidden;
        .selected-resources {
          float: left;
        }
        .resource-upload {
        }
      }
      .selected-resources {
        max-height: 4.8rem;
        overflow: hidden;
        .resource-types {
          text-align: left;
          .resource-type {
            height: 2rem;
            font-size: 1.2rem;
            line-height: 2rem;
            padding: 0 1rem 0 0;
            border-radius: 3px;
            display: inline-block;
            cursor: pointer;
            //font-weight: 700;
            color: #555;
            transition: background-color 100ms, color 100ms;
            &:hover {
              color: #2b90d9;
            }
          }
          .active {
            color: #2b90d9;
          }
        }
      }
      .resources-paging{
        height: 3rem;
        overflow: hidden;
        padding-top: 0.5rem;
      }
      .resources-body {
        font-size: 0;
        position: relative;
        min-height: 18rem;
        .resources-loading {
          width: 100%;
          height: 100%;
          font-size: 1.2rem;
          text-align: center;
          .loading-text {
          }
        }
        .resource-info {
          font-size: 1.2rem;
          height: 15rem;
          line-height: 15rem;
          font-weight: 700;
          text-align: center;
          .resource-picture {
            .remove-file {

            }
          }
          .upload {

          }
        }
        .resource {
          .resource-upload-body {

          }
        }
      }
      .resource-name {}
    }
  }
  img.image{
    max-width: 100%;
    height: 30rem;
  }
  .module-sr-footer{
    text-align: right;
    height: 3rem;
    margin-top: 0.5rem;
  }
  .module-sr-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
  }
  .module-sr-title{
    cursor: move;
    //font-weight: 700;
    margin-left: 1rem;
  }
  .module-sr-header .fa{
    cursor: pointer;
    color: #aaa;
    width: 3rem;
    position: absolute;
    top: 0;
    right: 0;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
  }
  .module-sr-header .fa:hover, .module-sr-header .fa:active{
    background-color: rgba(0,0,0,0.08);
    color: #777;
  }
  .module-sr-content{
    padding: 1rem;
  }
  .selected-resources{

  }

  .resource-type{

  }
  .resource-type:hover, .resource-type.active{
    /*background-color: #2b90d9;*/
    color: #2b90d9;
  }
   .resource-picture{
    height: 100%;
    width: 100%;
    background-size: cover;
  }
   .resource-picture.icon{
    background-size: 50%;
    background-position: center;
    background-repeat: no-repeat;
  }
  .resource-picture.upload{
    background-color: #eee;
    font-size: 1rem;
    position: relative;
    overflow: hidden;
    padding-top: 50%;
    text-align: center;
  }
  .uploadSelect {
    padding-top: 25%!important;
  }
  .resource-picture.upload .remove-file{
    position: absolute;
    top: 0;
    right: 0;
    height: 1.5rem;
    width: 1.5rem;
    line-height: 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    color: #aaa;
    text-align: center;
  }
  .resource-upload-body{
    height: 100%;
    width: 100%;
  }
  .upload-list{
    overflow-y: scroll;
    margin: 0.5rem 0;
  }

  .resource-padding-container {
    width: 19.5%;
    padding-top: 14.6%;
    margin-right: 0.5%;
    margin-bottom: 0.5%;
    display: inline-block;

    position: relative;
    .resource{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .resource-padding-container.resource-select{
    width: 24.5%;
    padding-top: 18.4%;
  }


  @media(max-width: 768px) {
    .resource-padding-container{
      width: 24.5%;
      padding-top: 18.4%;
    }
  }

  @media(max-width: 400px) {
    .resource-padding-container{
      width: 32.5%;
      padding-top: 24.3%;
    }
  }
  /*
  .resource{
    margin: 0 1% 1% 0;
    position: relative;
    font-size: 0;
    display: inline-block;
  }
  .resource-select {
    width: 23.5%;
    height: 7.5rem;
  }
  .resource-category {
     width: 25%;
     height: 13.7rem;
  }*/
  .selected-resource-header{
    margin-bottom: 0.5rem;
  }
   .resource>div{
  }
   .resource-name{
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    overflow: hidden;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    height: 1.6rem;
    color: #fff;
    line-height: 1.6rem;
    text-align: center;
    font-size: 1rem;
    background-color: rgba(0,0,0,0.2);
  }
   .resource-mask{
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-size: 1.4rem;
    color: #fff;
    text-align: right;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.1);
  }
   .resource-mask.active{
    background-color: rgba(0,0,0,0.6);
  }
   .resource-mask.active .fa{
    color: #00ff04;
  }
   .resource-index{
    position: absolute;
    margin: auto;
    color: #fff;
    z-index: 1000;
    font-size: 1.25rem;
    top: 0;
    font-weight: 700;
    left: 0.3rem;
  }
  .resource-link{
    height: 100%;
    width: 100%;
  }
  .resource-info{

  }
  .file-lists{
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .file-li{
    position: relative;
    margin-bottom: 0.5rem;
    word-break: break-all;
    min-height: 4rem;
    color: #fff;
    border-radius: 3px;
    background-color: #575757;
  }
  .file-li.active{
    background-color: #47c449;
  }
  .file-name{
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding-top: 0.6rem;
  }
  .file-size{
    font-size: 1rem;
  }
  .file-btn{
    height: 4rem;
    top: 0;
    right: 0;
    vertical-align: top;
    font-size: 1rem;
    width: 7rem;
    line-height: 4rem;
    text-align: center;
    position: absolute;
  }
  .file-info{
    overflow: hidden;
    margin-right: 7rem;
    padding-left: 1rem;
  }
  .file-hidden{
    /*width: 10000px;*/
  }
  .file-btn>.fa{
    cursor: pointer;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid #777;
    color: #eee;
    border-radius: 50%;
    text-align: center;
    line-height: 2.4rem;
    margin-right: 0.5rem;
  }
  .file-btn .fa.fa-remove:hover{
    border-color: #aaa;
  }
  .file-btn .fa.fa-arrow-up:hover{
    border-color: #aaa;
  }
  .file-btn .fa.upload-progress{
    border:none;
    width: 6.5rem;
  }
  .file-progress{
    position: absolute;
    height: 3px;
    width: 0;
    transition: width 200ms;
    bottom: 0;
    background-color: #57cd59;
    border-radius: 2px;
  }
  .upload-success{
    border-color: #e6e6e6!important;
  }
  .file-error {
    color: #ff6c6a;
    margin-left: 1rem;
    font-size: 1rem;
  }
   .resource-options{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
   .resource-options .resource-do{
    color: #fff;
    cursor: pointer;
    font-size: 1.4rem;
    position: absolute;
    top: 0;
    right: 0;
     .fa:hover {
       color: #0e90d2;
     }
  }
   .resource .fa {
     margin: 5px 5px 0 0;
   }
   .resource-options .fa.fa-edit{
  }
  .edit-picture-body{
    margin: 1rem;
  }
   .resource-options .fa.active{
    color: #00ff04;
  }
   .paste-content{
    display: inline-block;
    width: 20rem;
    height: 2.5rem;
    line-height: 2.3rem;
    margin-left: 1rem;
    text-align: center;
    border: 2px dotted #9baec8;
    background-color: #d9e1e8;
    vertical-align: top;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 0.2rem;
  }

  .resource-in-process{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    height: 2rem;
    width: 100%;
    color: #545454;
    text-align: center;
    font-size: 1.1rem;
  }

  .resource-in-process-bg{
    background-color: #a6a6a6;
  }

  .resource-picture.media-picture {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: black;
  }

  .size-limit{
    margin-left: 0.5rem;
    font-size: 1rem;
  }
  .size-limit .fa{
    color: #555;
  }
</style>
<script>
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';
import {getFileMD5, blobToFile} from "../js/file";
import {getSize, timeFormat, getUrl} from "../js/tools";
import {debounce} from '../js/execution';
import {visitUrl} from "../js/pageSwitch";
import {nkcAPI, nkcUploadFile} from "../js/netAPI";
import {getState} from '../js/state';
import {screenTopWarning} from '../js/topAlert';
import {getSocket} from '../js/socket';
import ImageViewer from "./ImageViewer";
import ResourceInfo from "./ResourceInfo";
import CommonModal from "./CommonModal";
import SelectCategory from "./SelectCategory";
import {openImageViewer} from "../js/imageViewer";

const {isApp} = getState();
import {
  RNTakePictureAndUpload,
  RNTakeAudioAndUpload,
  RNTakeVideoAndUpload
} from '../js/reactNative';
const socket = getSocket();
export default {
  props: ['watch-type'],
  data: () => ({
    getResourcesDebounce: '',
    categoryLoading: true,//分组loading
    resourceType: 'all',
    resourceCategories: 'all',//用户自定义分组存储id
    resources: [],
    paging: {},
    files: [],
    categories: [],
    category: 'all',
    isApp,
    uid: "",
    user: "",
    pageType: "list", // list: 资源列表, uploader: 上传
    quota: 16,
    pageNumber: "",
    allowedExt: ['all', 'audio', 'video', 'attachment', 'picture'],
    countLimit: 100,
    selectedResources: [],
    loading: true,
    fastSelect: false,
    pictureExt: ['swf', 'jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'],
    croppingPicture: false,
    isTouchEmit: false,
    sizeLimit: null,
    callback: null,

    cropper: null,

    socketEventListener: null,
    count: {
      allCount: 0,//全部资源数量
      ungroupedCount: 0,//未分组资源数量
      trashCount: 0,//回收站资源数量
    },
    imgInfo:{},
    reduction:[0,180,-180],
    minContainerHeight:500,
    socketEventListenerDebounce: "",
    debounce: ""
  }),
  components: {
    'image-viewer': ImageViewer,
    'resource-info': ResourceInfo,
    'common-modal': CommonModal,
    'select-category': SelectCategory,
  },
  created(){
    this.debounce = debounce;
    this.getResourcesDebounce = debounce(this.getResources, 500)
  },
  mounted() {
    if(this.watchType === 'category') {
      this.getResourcesDebounce(0);
    }
    this.initSocketEvent();
    this.initDragUploadEvent();
  },
  destroyed() {
    this.removeSocketEvent();
    this.destroyCropper();
    this.destroyDraggable();
    this.disableDragUploadEvent();
  },
  computed: {
    fileSizeLimit: function() {
      var sizeLimit = this.sizeLimit;
      if(!sizeLimit) return '';
      var arr = [];
      arr = arr.concat(sizeLimit.others);
      arr.push({
        ext: '其他',
        size: sizeLimit.default
      });
      var str = '文件大小限制\n', sweetStr = '';
      for(var i = 0; i < arr.length; i++) {
        var a = arr[i];
        if(i > 0) str += '\n';
        str += a.ext.toUpperCase() + '：' + getSize(a.size * 1024, 1);
      }
      return str;
    },
    show: function() {
      var obj = {};
      var allowedExt = this.allowedExt;
      if(allowedExt.indexOf("audio") !== -1) {
        obj.audio = true;
      }
      if(allowedExt.indexOf("video") !== -1) {
        obj.video = true;
      }
      if(allowedExt.indexOf("picture") !== -1) {
        obj.picture = true;
      }
      if(allowedExt.indexOf("attachment") !== -1) {
        obj.attachment = true;
      }
      if(
        allowedExt.indexOf("all") !== -1 ||
        (obj.audio && obj.video && obj.picture && obj.attachment)
      ) {
        obj.all = true;
      }
      return obj
    },
    windowWidth: function() {
      return $(window).width();
    },
    windowHeight: function() {
      return $(window).height();
    },
    screenType: function() {
      return this.windowWidth < 700? "sm": "md";
    },
    selectedResourcesId: function() {
      var arr = [];
      var selectedResources = this.selectedResources;
      for(var i = 0; i < selectedResources.length; i++) {
        var r = selectedResources[i];
        if(arr.indexOf(r.rid) === -1) {
          arr.push(r.rid);
        }
      }
      return arr;
    }
  },
  methods: {
    timeFormat: timeFormat,
    getUrl: getUrl,
    initCropper() {
      if(this.cropper) return;
      this.cropper = new Cropper(this.$refs.imageElement, {
        viewMode: 0,
        minContainerHeight:this.minContainerHeight,
        // aspectRatio: 1,
        crop:(e)=>{
          if(this.$refs.imageElement.height > this.$refs.imageElement.width){
            this.imgInfo.radio = this.$refs.imageElement.width / this.$refs.imageElement.height
            this.imgInfo.max = 'height'
            this.imgInfo.value = this.$refs.imageElement.height
          }else{
            this.imgInfo.radio = this.$refs.imageElement.width / this.$refs.imageElement.height
            this.imgInfo.max = 'width'
            this.imgInfo.value = this.$refs.imageElement.width
          }
          //- 如果宽大于高  旋转后 w 408（容器h）
          //- 如果高大于宽  旋转后 h 408（容器h）
          // 对比旋转前的 高 和 宽 小了多少
          // 然后 根据比率 来缩小 scale
          this.rotateValue = e.detail.rotate
        }
      });
    },
    destroyCropper() {
      if(!this.cropper || !this.cropper.destroy) return;
      this.cropper.destroy();
      this.cropper = null;
    },
    destroyDraggable() {
    },
    showErrorInfo(r) {
      sweetInfo(r.errorInfo);
    },
    // 注册事件，当上传的文件处理成功后更新列表
    initSocketEvent() {
      const self = this;
      this.socketEventListener = function(data) {
        if(data.state === "fileProcessFailed") {
          sweetError(`文件处理失败\n${data.err}`);
        }
        self.getResources(0, data.requestType);
      }
      this.socketEventListenerDebounce = this.debounce(this.socketEventListener, 500);
      // 统一用一个防抖函数，最大程度的减少相同请求
      socket.on("fileTransformProcess", this.socketEventListenerDebounce );
      socket.on('resources',this.socketEventListenerDebounce );
      socket.on('group', this.socketEventListenerDebounce);
    },
    // 销毁注册的 socket 事件
    removeSocketEvent() {
      if(!this.socketEventListener) return;
      // 销毁事件
      socket.off('fileTransformProcess', this.socketEventListenerDebounce);
      socket.off('resources', this.socketEventListenerDebounce);
      socket.off('group', this.socketEventListenerDebounce);
    },
    initDragUploadEvent() {
      const $dragDom = $(this.$refs.pasteContent);
      let originText = "";
      const self = this;
      $dragDom.on({
        dragenter: function(e) {
          e.stopPropagation();
          e.preventDefault();
          originText = $dragDom.text();
          $dragDom.text("松开鼠标上传文件")
        },
        dragleave: function(e) {
          e.stopPropagation();
          e.preventDefault();
          $dragDom.text(originText);
        },
        dragover: function(e) {
          e.stopPropagation();
          e.preventDefault();
        },
        drop: function(e) {
          e.preventDefault();
          e.stopPropagation();
          $dragDom.text(originText);
          var files = [].slice.call(e.originalEvent.dataTransfer.files);
          if(!files.length) return;
          self.uploadSelectFile(files);
        }
      });
    },
    disableDragUploadEvent() {
      $(this.$refs.pasteContent).draggable('disable');
    },
    checkFileSize: function(filename, size) {
      var sizeLimit = this.sizeLimit;
      if(!sizeLimit) return;
      var ext = filename.split('.');
      ext = ext.pop().toLowerCase();
      var limit;
      for(var i = 0; i < sizeLimit.others.length; i++) {
        var s = sizeLimit.others[i];
        if(s.ext.toLowerCase() === ext) {
          limit = s;
          break;
        }
      }
      if(!limit) limit = {
        ext: ext,
        size: sizeLimit.default
      };
      var _limitSize = limit.size * 1024;
      if(size > _limitSize) throw ext.toUpperCase() + '文件大小不能超过' + getSize(_limitSize, 1);
    },
    showFileSizeLimit: function() {
      asyncSweetCustom(this.fileSizeLimit.replace(/\n/ig, '<br>'));
    },
    cancelCropPicture: function() {
      this.destroyCropper();
      this.changePageType("list");
    },
    rotateZoom(originValue, nextValue){
      if(this.reduction.includes(this.rotateValue)){
        this.cropper.scale(1);
      }else{
        const scaleRadio = originValue / nextValue;
        this.cropper.scale(scaleRadio);
      }
    },
    rotate: function(type) {
      const self = this;
      if(type === "left") {
        self.cropper.rotate(-90);
      } else {
        self.cropper.rotate(90);
      }
      // crop执行 > 再执行的下面的代码
      const contaiorWidth = parseInt(document.querySelector('.cropper-container').style.width)
      const imgWidthInCanvas = self.minContainerHeight * self.imgInfo.radio;
      //- const imgHeightInCanvas = contaiorWidth / self.imgInfo.radio;
      if(self.imgInfo.max === 'width'){
        // 宽占满
        if(contaiorWidth <= imgWidthInCanvas){
          const nextImgWidthInCanvas = (self.minContainerHeight / contaiorWidth) * (contaiorWidth / self.imgInfo.radio)
          if(nextImgWidthInCanvas > contaiorWidth){
            this.rotateZoom(contaiorWidth, self.minContainerHeight)
          }else{
            this.rotateZoom(self.minContainerHeight, contaiorWidth)
          }
          //- this.rotateZoom(self.minContainerHeight, contaiorWidth)
          // 高占满
        }else{
          // 如果旋转后宽度超出容器宽 最后以容器宽度进行显示
          // imgWidthInCanvas 旋转前图片宽度
          // self.minContainerHeight 旋转后图片宽度变为容器高度
          // 乘以得出的缩放比率 旋转前图片高度  就是 旋转后的图片在容器中的宽度
          const nextImgWidthInCanvas = (imgWidthInCanvas / self.minContainerHeight) * self.minContainerHeight
          // 如果下张图片宽大于容器宽，那么以容器宽显示图片
          if(nextImgWidthInCanvas > contaiorWidth){
            this.rotateZoom(imgWidthInCanvas, self.minContainerHeight)
          }else{
            this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
          }
        }
      }else if(self.imgInfo.max === 'height'){
        // 宽占满   高>宽 那么什么情况下 宽会占满 （只有容器高度大于容器宽度会出现）好像没有此种情况？？
        if(contaiorWidth <= imgWidthInCanvas){
          this.rotateZoom(self.minContainerHeight, contaiorWidth)
          // 高占满
        }else{
          // 当图片宽高很接近时 如果让图片高度直接变为容器宽，那么图片高度将会超出容器
          // contaiorWidth 下次图片宽度
          // self.minContainerHeight 当前图片高度
          // nextImgHeightInCanvas 计算出的下次图片高度
          const nextImgHeightInCanvas = (contaiorWidth / self.minContainerHeight) * (imgWidthInCanvas)
          //- 如果旋转后的高 大于容器高 那么以容器高来显示图片
          if(nextImgHeightInCanvas > self.minContainerHeight){
            this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
          }else{
            this.rotateZoom(contaiorWidth, self.minContainerHeight)
          }
          // 这个适用于 山峰图 高宽比率相差较小
          //- this.rotateZoom(self.minContainerHeight, self.minContainerHeight * self.imgInfo.radio)
        }
      }
    },
    editImage: function(r) {
      const self = this;
      this.croppingPicture = false;
      this.changePageType("editPicture");
      setTimeout(() => {
        self.initCropper();
        let src = '';
        if(r.originId) {
          src = getUrl('resourceOrigin', r.originId);
        } else {
          src = getUrl('resource', r.rid);
        }
        self.cropper.replace(src);
      });
    },
    cropPicture: function() {
      const self = this;
      self.croppingPicture = true;
      setTimeout(function() {
        try{
          self.cropper.getCroppedCanvas().toBlob(function(blob) {
            var file = blobToFile(blob, Date.now() + ".png");
            self.uploadSelectFile(file);
            self.changePageType("list");
            self.destroyCropper();
          }, "image/jpeg");
        } catch(err) {
          console.log(err);
          self.croppingPicture = false;
          sweetError(err);
        }
      }, 10);
    },
    readyPaste: function() {
      var self = this;
      var dom = $(window);
      dom.off("paste");
      dom.one("paste", function(e) {
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
        var files = clipboardData.items || [];
        var _files = [];
        for(var i = 0; i < files.length; i ++) {
          var file = files[i].getAsFile();
          if(!file) continue;
          _files.push(file);
        }
        if(!_files.length) return;
        self.uploadSelectFile(_files);
      });
    },
    close: function() {
      this.destroyCropper();
      const self = this;
      setTimeout(function() {
        self.selectedResources = [];
        self.resourceType = "all";
        self.category = "all";
      }, 500);
    },
    open: function(callback, options = {}) {
      this.watchType = 'select';
      this.destroyCropper();
      const {
        countLimit = 50,
        allowedExt = ['all', 'audio', 'video', 'attachment', 'picture'],
        pageType = 'list',
        fastSelect = false
      } = options;
      const resourceType = options.resourceType || allowedExt[0];

      this.callback = callback;
      this.countLimit = countLimit;
      this.allowedExt = allowedExt;
      this.resourceType = resourceType;
      this.pageType = pageType;
      this.fastSelect = fastSelect;
      this.getResourcesDebounce(0);
    },
    selectCategory: function(c) {
      this.category = c;
      this.getResourcesDebounce(0);
    },
    getResources: function(skip = 0, reqType = 'all') {
      this.loading = true;
      let {
        quota,
        resourceType,
        category,
        resourceCategories
      } = this;
      //当选择资源时每页16个，否则为18个
      if(this.watchType === 'category') quota = 18;
      // quota 每页数据量 skip 第几页 resource Type '全部 已上传 未上传' category 资源类型
      const url = `/me/media?quota=${quota}&skip=${skip}&type=${resourceType}&c=${category}&resourceCategories=${resourceCategories}&t=${Date.now()}&reqType=${reqType}`;
      const self = this;
      nkcAPI(url, "GET")
        .then(function(data) {
          if (reqType === "resources" ) {
            self.resources = data.resources;
          }else if (reqType === "group") {
            self.categories = data.categories;
          }else {
            self.categories = data.categories;
            self.sizeLimit = data.sizeLimit;
            self.paging = data.paging;
            self.count = data.count;
            self.pageNumber = self.paging.page + 1;
            self.resources = data.resources;
            self.loading = false;
            self.categoryLoading = false;
          }
          if(self.watchType === 'select') {
            if(self.callback) {
              self.callback();
            }
          }
        })
        .catch(function(data) {
          sweetError(data);
        });
    },
    changePage: function(type) {
      var paging = this.paging;
      if(paging.buttonValue.length <= 1) return;
      if(type === "last" && paging.page === 0) return;
      if(type === "next" && paging.page + 1 === paging.pageCount) return;
      var count = type === "last"? -1: 1;
      this.getResourcesDebounce(paging.page + count);
    },
    clickInput: function() {
      if(this.files.length >= 20) sweetInfo("最多仅允许20个文件同时上传，请稍后再试。");
      var input = this.$refs.inputElement;
      if(input) input.click();
    },
    removeFile: function(index) {
      this.files.splice(index, 1);
    },
    startUpload: function(f) {
      f.error = "";
      this.selectCategory("upload");
      const self = this;
      return Promise.resolve()
        .then(function() {
          self.checkFileSize(f.data.name, f.data.size);
          if(f.status === "uploading") throw "文件正在上传...";
          if(f.status === "uploaded") throw "文件已上传成功！";
          f.status = "uploading";
          // 获取文件md5
          return getFileMD5(f.data);
        })
        .then(function(md5) {
          // 将md5发送到后端检测文件是否已上传
          return nkcAPI('/rs/md5', 'POST', {
            md5,
            filename: f.name
          });
        })
        .then(function(data) {
          if(!data.uploaded) {
            // 后端找不到相同md5的文件（仅针对附件），则将本地文件上传
            var formData = new FormData();
            formData.append("file", f.data, f.data.name || (Date.now() + '.png'));
            formData.append('cid', self.resourceCategories);
            return nkcUploadFile("/r", "POST", formData, function(e, progress) {
              f.progress = progress;
            }, 60 * 60 * 1000);
          }
        })
        .then(function() {
          f.status = "uploaded";
          var index = self.files.indexOf(f);
          self.files.splice(index, 1);
        })
        .catch(function(data) {
          f.status = "unUpload";
          f.progress = 0;
          f.error = data.error || data;
          screenTopWarning(data.error || data);
        })
    },
    newFile: function(file) {
      return {
        name: file.name,
        ext: file.type.slice(0, 5) === "image"?"picture": "file",
        size: getSize(file.size, 1),
        data: file,
        error: /*file.size >  200*1024*1024?"文件大小不能超过200MB":*/ "",
        progress: 0,
        status: "unUpload"
      }
    },
    uploadSelectFile: function(f) {
      var self = this;
      if(f.constructor === Array) {
        //上传多个文件
        // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
        f.forEach(function(file) {
          if(!file.name && file.type.indexOf('image') !== -1) {
            file.name = Date.now() + Math.round(Math.random()*1000) + '.png';
          }
          self.files.push(self.newFile(file));
        });
      } else {
        //上传单个文件
        f = self.newFile(f);
        self.files.unshift(f);
      }
      // return console.log(self.files);
      // var promise = this.startUpload(f);
      return self.uploadFileSeries()
        .then(function() {
          console.log("【全部上传完成】");
          if(self.category === "upload" && !self.files.length) {
            setTimeout(function() {
              self.category = "all";
              self.getResourcesDebounce(0);
            }, 1000)
          }
        })
    },
    uploadFileSeries() {
      const self = this;
      var file;
      for(var i = 0; i < self.files.length; i++) {
        var f = self.files[i];
        if(f.status !== 'unUpload' || f.error) continue;
        file = f;
        break;
      }
      // var file = self.files[0];
      if(!file) return Promise.resolve();
      return self.startUpload(file)
        .then(new Promise(function(resolve, _) {
          console.log("【上传成功】", file.name);
          setTimeout(resolve, 1000);
        }))
        .then(function() {
          return self.uploadFileSeries();
        })
    },
    // 用户已选择待上传的文件
    selectedFiles: function() {
      var self = this;
      var input = this.$refs.inputElement;
      // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
      var files = [].slice.call(input.files);
      input.value = "";
      if(files.length <= 0) return;
      self.uploadSelectFile(files);
    },
    changePageType: function(pageType) {
      const self = this;
      self.pageType = pageType;
      if(pageType === "list") {
        self.crash();
      }
    },
    crash: function() {
      var paging = this.paging;
      this.getResourcesDebounce(paging.page);
    },
    done: function() {

      if(!this.callback) return;
      var selectedResources = this.selectedResources;
      var selectedResourcesId = this.selectedResourcesId;
      this.callback({
        resources: selectedResources,
        resourcesId: selectedResourcesId
      });
      this.close();
    },
    fastSelectPage: function() {
      var pageNumber = this.pageNumber - 1;
      var paging = this.paging;
      if(!paging || !paging.buttonValue.length) return;
      var lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
      if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
      this.getResourcesDebounce(pageNumber);
    },
    getIndex: function(arr, r) {
      var index = -1;
      for(var i = 0; i < arr.length; i++) {
        if(arr[i].rid === r.rid) {
          index = i;
          break;
        }
      }
      return index;
    },
    visitUrl: function(url) {
      visitUrl(url, true);
    },
    removeSelectedResource: function(index) {
      this.selectedResources.splice(index, 1);
    },
    fastSelectResource: function(r) {
      if(this.fastSelect) {
        if(this.callback) this.callback(r);
      } else {
        this.selectResource(r);
      }
    },

    //选中资源文件
    selectResource: function(r) {
      const self = this;
      if(self.watchType === 'select') {
        var index = self.getIndex(self.selectedResources, r);
        if(index !== -1) {
          self.selectedResources.splice(index, 1);
        } else {
          if(self.selectedResources.length >= self.countLimit) return;
          self.selectedResources.push(r);
        }
      } else if (self.watchType === 'category') {
        if(self.selectedResources.length) {
          self.checkbox(r);
        } else if(r.state === 'usable') {
          if(r.mediaType === "mediaPicture") {
            self.openImages(r.rid);
          } else if (r.mediaType === "mediaVideo" || r.mediaType === "mediaAudio" ) {
            window.open(`/r/${r.rid}`);
          } else if(r.mediaType === "mediaAttachment") {
            self.$refs.resourceInfo.open({rid: r.rid});
          }
        }
      }
    },
    openImages(rid) {
      const images = [];
      let index = 0;
      for(const r of this.resources) {
        if(r.mediaType !== 'mediaPicture' || r.state !== 'usable') continue;
        images.push({
          url: getUrl('resource', r.rid, 'lg'),
          name: r.oname,
        });
        if(r.rid === rid) index = images.length - 1;
      }
      if(images.length === 0) return;
      openImageViewer(images, index);
    },
    selectResourceType: function(t) {
      this.resourceType = t;
      this.getResourcesDebounce(0);
    },
    takePicture: function() {
      const self = this;
      RNTakePictureAndUpload({}, () => {
        self.crash();
      });
    },
    takeVideo: function() {
      const self = this;
      RNTakeVideoAndUpload({}, () => {
        self.crash();
      });
    },
    recordAudio: function() {
      const self = this;
      RNTakeAudioAndUpload({}, () => {
        self.crash();
      });
    },
    //移动到回收站和恢复资源
    delResource: debounce(function (r, type) {
      const self = this;
      if(this.watchType !== 'category') return;
      const resources = [];
      if(r) {
        resources.push(r.rid);
      } else{
        for(const r of self.selectedResources) {
          if(!r) return;
          resources.push(r.rid);
        }
      }
      return sweetQuestion(`确定要执行当前操作？`)
        .then(() => {
          nkcAPI(`/r/${resources[0]}/del`, 'POST', {
            resources,
            type,
          })
            .then(() => {
              self.selectedResources = [];
              self.getResourcesDebounce(0);
            })
            .catch(err => {
              sweetError(err);
            })
        })
        .catch(err => {
          sweetError(err);
        })
    }, 300),
    //点击用户自定义分组 重复点击去除同一id
    selectUserCategory(_id) {
      if(!_id) return;
      if(_id === 'all') {
        this.category = 'all';
        this.resourceType = 'all';
      }
      this.resourceCategories = _id;
      this.getResourcesDebounce(0);
    },
    //获取用户资源分组
    getCategories: debounce(function () {
      const self = this;
      nkcAPI(`/rc`, 'GET', {})
      .then(res => {
        self.categories = res.categories;
        self.categoryLoading = false;
      })
      .catch(err => {
        console.log(err);
        sweetError(err);
      })
    }, 300),
    //创建， 编辑， 删除用户自定义分组
    editResourceCategory: debounce(function(c, type,callback) {
      const self = this;
      if(type === 'delete') {
        return sweetQuestion(`确定要执行当前操作？`)
          .then(() => {
            nkcAPI('/rc', 'post', {
              _id: c?c._id:'',
              type,
            })
              .then(() => {
                sweetSuccess('操作成功');
                if(callback) callback();
                self.getCategories();
              })
              .catch(err => {
                console.log(err);
                sweetError(err);
              })
          })
          .catch(err => {
            sweetError(err);
          })
      }
      return self.$refs.categoryModal.open(function (data) {
        if(!data) return sweetError('参数错误');
        const name = data[0].value;
        return nkcAPI('/rc', 'POST', {
          name,
          type,
          _id: c?c._id:''
        })
        .then(() => {
          self.categoryLoading = true;
          sweetSuccess('操作成功');
          if(callback) callback();
          self.getCategories();
          self.$refs.categoryModal.close();
        })
        .catch(err => {
          sweetError(err);
        })
       }, {
        title: '新建分组',
        data: [
          {
            label: '请输入分组名',
            dom: 'input',
            value: c?c.name:'',
            max: '10'
          },
        ]
      });
    }, 300),
    //编辑按钮
    editCategory() {
      const self = this;
      this.$refs.selectCategory.open(() => {}, {
        categories: self.categories,
      });
    },
    //资源管理多选
    checkbox(r) {
      let index = this.getIndex(this.selectedResources, r);
      if(index !== -1) {
        this.selectedResources.splice(index, 1);
      } else {
        if(this.selectedResources.length >= this.countLimit) return;
        this.selectedResources.push(r);
      }
    },
    //移动到分组
    moveToCategory: debounce(function () {
      const self = this;
      let resources = [];
      for(const r of self.selectedResources) {
        if(!r) return;
        resources.push(r.rid);
      }
      self.$refs.selectCategory.open(function (cid){
        if(cid === self.resourceCategories) return sweetError('资源已存在当前分组');
        nkcAPI(`/rc/move`, 'POST', {
          resources,
          cid
        })
        .then(res => {
          sweetSuccess('操作成功');
          self.resourceCategories = cid;
          self.selectedResources = [];
          self.getResourcesDebounce(0);
          self.$refs.selectCategory.close();
        })
        .catch(err => {
          sweetError(err);
        })
      },{
        categories: self.categories,
      });
    }, 300),
    //全选文件
    selectAllResources() {
      if(this.selectedResources.length === this.resources.length) {
        this.selectedResources = [];
      } else {
        this.selectedResources = [].concat(this.resources);
      }
    }
  },
}
</script>
