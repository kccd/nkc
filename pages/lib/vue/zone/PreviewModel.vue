<template lang="pug">
transition(name='main')
  #ImgPreview(
    v-show='viewerVisibleShow',
    ref='ImgPreview',
    @click='clickPreview',
    @wheel='stopEvent'
  )
    .titleBar(ref='titleBar', @click='modelClose')
      .pagIndex {{ `${imgI+1} / ${imgData.length}`}} 
        //- p(style="font-size:1.2rem;color:white") {{ `start:${parseInt(touchData.startX[0])}：${parseInt(touchData.startY[0])}、${parseInt(touchData.startX[1])}：${parseInt(touchData.startY[1])}` }}   
        //- p(style="font-size:1.2rem;color:white") {{ `end ${parseInt(touchData.endX[0])}： ${parseInt(touchData.endY[0])}、${parseInt(touchData.endX[1])} ：${parseInt(touchData.endY[1])}` }}
        //- p(style="font-size:1.2rem;color:white") {{ `${parseInt(Math.sqrt( (touchData.startX[0]-touchData.startX[1]) *(touchData.startX[0]-touchData.startX[1]) +   (touchData.startY[0]-touchData.startY[1]) *(touchData.startY[0]-touchData.startY[1])  ))} `}}
        //- p(style="font-size:1.2rem;color:white") {{this.locationData.isMove }} {{ this.startDrag  }} {{ this.touchData.isScale }}
      span.closeBtn
    .pre(ref='preCover' v-show=" imgI !== 0")
      span.fa.fa-chevron-circle-left(ref='preBtn', @click='prevImg')
    .next(ref='nextCover' v-show=" imgI+1 < imgData.length")
      span.fa.fa-chevron-circle-right(ref='nextBtn', @click='nextImg')
    #imgPreview(ref='imgPreview')
      //- 加载动画
      .loading(v-if='loading')
        span.fa.fa-spinner.fa-spin.fa-fw
        span.loading-text 加载中...
      .videoContainer(v-show=" imgType === 'video'"  ref='videoContainer')
        .video-player-container(ref='video' :style="videoWidthStyle" ) 
          video-player(v-if="imgType === 'video'" :file="videoFile" :ratio="videoRatio")
      .imgContainer( v-show=" imgType === 'picture'" ref='imgContainer')
        img(
          ref='img',
          :src='imgSrc',
          :style='{ width: imgWidth + "px", height: imgHeight + "px" }',
          @mousedown.capture.self='mousedown',
          @mouseup='mouseup',
          @wheel='mousewheel',
          @dblclick="doubleClick",
          @touchstart="touchStart",
          @touchmove="touchMove",
          @touchend="touchEnd"
        )
    //- 预览窗的功能区
    .toolBar(ref='toolBar' v-show=" imgType === 'picture' ")
      transition(name='main')
        .scaleTips(v-if="scaleShow") {{`${Math.round(scaleSize * 100)}%`}}
      .btnGroup
        div
          //-img(src='/statics/preview-model/rotate.png', @click='rotateImg')
          span.fa.fa-rotate-right(style="font-size:2rem;color:white" @click='rotateImg')
        div
          //-img(src='/statics/preview-model/reset.png', @click='reset')
          span.fa.fa-refresh(style="font-size:2rem;color:white" @click='reset')
</template>
<style>
.model-open{
  overflow: hidden;
}
</style>
<style lang="less" scoped>
.video-player-container{
  width: 100vh;
@media (max-width: 991px) {
  width: 100vw;
}

}
.main-enter,
.main-leave-to {
  opacity: 0;
}

.main-enter-active,
.main-leave-active {
  transition: all 0.4s ease;
}
#ImgPreview {
  position: fixed;
  z-index: 2015;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(7px);
}
#ImgPreview .titleBar {
  position: absolute;
  z-index: 2016;
  right: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  //border-bottom-left-radius: 3rem;
  width: 4rem;
  height: 4rem;
  text-align: center;
  line-height: 4rem;
  &:hover {
    background: rgba(0, 0, 0, 0.65);
  }
  cursor: pointer;
}
#ImgPreview .titleBar .pagIndex {
  pointer-events: none;
  color: white;
  font-size: 1.2rem;
  position: fixed;
  top: 5vh;
  left:calc( 50% - 0.5rem );
  transform: translate(-50%, -50%);
}
#ImgPreview .titleBar .closeBtn {
  //position: absolute;
  color: white;
  font-size: 3.5rem;
  &::before {
    content: '×';
  }
}
#ImgPreview .pre {
  position: absolute;
  left: 5%;
  top: calc(50% - 1.5rem);
  cursor: pointer;
  z-index: 2019;
  span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 3.2rem;
    transition: color 0.15s;
    &:hover {
      color: white;
    }
  }
}
#ImgPreview .next {
  position: absolute;
  right: 5%;
  top: calc(50% - 1.5rem);
  cursor: pointer;
  z-index: 2019;
  span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 3.2rem;
    transition: color 0.15s;
    &:hover {
      color: white;
    }
  }
}
#ImgPreview #imgPreview {
  width: 100%;
  height: 100%;
  -webkit-user-select: none; /* Chrome, Safari, Opera */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE/Edge */
  user-select: none; /* Standard syntax */
}
#ImgPreview #imgPreview .loading {
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    -webkit-user-select: none; /* Chrome, Safari, Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE/Edge */
    user-select: none; /* Standard syntax */
    font-size: 1.2rem;
    color: white;
  }
}
#ImgPreview #imgPreview .imgContainer {
  position: absolute;
}
#ImgPreview #imgPreview .videoContainer {
  position: absolute;
}
#ImgPreview #imgPreview .imgContainer img {
  position: absolute;
  cursor: grab;
}
#ImgPreview #imgPreview .videoContainer video {
  position: absolute;
  cursor: pointer;
}
#ImgPreview .toolBar {
  z-index: 2016;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 50px;
}
#ImgPreview .toolBar .btnGroup {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  background: rgba(0, 0, 0, 0.65);
  height: 50px;
  margin: 0 auto;
  border-radius: 7px 7px 0 0;
}
#ImgPreview .toolBar .scaleTips {
  color: white;
  position:absolute;
  left:50%;
  top:calc(50% - 45px);
  transform:translate(-50%,-50%);
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.65);
  background-image: none;
  padding: 0.1rem 0.6rem;
  border-radius: 4rem;
}
#ImgPreview .toolBar .btnGroup div {
  cursor: pointer;
  margin: 0 22px 0 22px;
}
</style>

<script>
import { getState } from '../../js/state';
import VideoPlayerVue from '../VideoPlayer';
export default {
  data: () => ({
    viewerVisibleShow: false,
    imgData: [],
    imgI: 0,
    videoFile:{},
    locationData: {
      isMove: '', //是否移动
      startX: '', //鼠标按下时距离窗口的X轴距离
      startY: '', //鼠标按下时距离窗口的Y轴距离
      endX: '', //move停下时距离窗口的X轴距离
      endY: '', //move停下时距离窗口的Y轴距离
      imgLeft: '', //鼠标点距离窗口的left
      imgTop: '', //鼠标点距离窗口的top
      distanceX: 0, //鼠标点距离窗口的X距离
      distanceY: 0, //鼠标点距离窗口的Y距离
      isDoubleClick: false,//是否双击
    },
    touchData:{
      startX: [0,0], //鼠标按下时距离窗口的X轴距离
      startY: [0,0], //鼠标按下时距离窗口的Y轴距离
      endX: [0,0], //move停下时距离窗口的X轴距离
      endY: [0,0], //move停下时距离窗口的Y轴距离
      imgMoveWidth: 0,
      imgMoveHeight: 0,
      isScale:false
    },
    wheelData:{
      imgWheelWidth: 0,
      imgWheelHeight: 0,
    },
    imgType: '',
    rotateDeg: 0, // 旋转角度
    preImgData: '',//预加载后图片的数组
    imgSrc: '', // 预览图片的src
    scaleSize: 0,//缩放系数
    imgName: 'loading error',//图片名
    imgWidth: 0,//图片的宽度
    imgHeight: 0,//图片的高度
    imgw: 0,//图片的clientWidth
    imgh: 0,//图片的clientHeight
    imgContainerWidth: 0,//图片容器的clientHeight
    imgContainerHeight: 0,//图片容器的clientHeight
    imgDataListLength: 0, // 数组的长度
    loading: false, // 加载动画
    error: false, // 错误图片的加载状态
    snapImgIndex: 0, // 在调用Retry的临时数据
    preloadImgData: [],//预加载后图片的数据
    videoRatio:'4:3',
    videoWidthStyle:'',
    startDrag : false,
    touchTime: 0,
    touchDouble : false,
    scaleShow: false,
    scaleShowTimer: null
  }),
  components: {
      'video-player': VideoPlayerVue,
    },
  destroyed(){
    document.body.className = '';
    document.body.style.paddingRight =`0px`
  },
  computed: {
    //imgContainer节点
    imgContainer() {
      return this.$refs.imgContainer
    },
    videoContainer() {
      return this.$refs.videoContainer
    },
    //imgElement的节点
    imgElement() {
      return this.$refs.img;
    },
    videoElement() {
      return this.$refs.video;
    },
    //imgElement的样式
    imgStyle() {
      return this.imgElement.style;
    },
    // videoStyle() {
    //   return this.imgElement.style;
    // },
    isMobile() {
      const userAgent = navigator.userAgent.toLowerCase();
      const {isApp} = getState();
      return /mobile|android|iphone|ipad|phone/.test(userAgent) || isApp;
    },

  },
  watch: {
    viewerVisibleShow: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          document.addEventListener('keydown', this.handleKeyDown);
          window.addEventListener('resize', this.reloadLocation);
          if(this.isMobile){
            window.history.pushState(null, '', '#');
            window.addEventListener('popstate', this.historyForBack);
          }
          document.body.style.paddingRight =`${window.innerWidth - document.body.clientWidth}px`;
          document.body.className = 'model-open';
        } else {
          document.removeEventListener('keydown', this.handleKeyDown);
          window.removeEventListener('resize', this.reloadLocation);
          if(this.isMobile){
            window.removeEventListener('popstate', this.historyForBack);
          }
          document.body.className = '';
          document.body.style.paddingRight =`0px`
          this.locationData.isMove = false;
        }
      },
    }
  },
  methods: {
    historyForBack(event){
      // event.preventDefault();
      // window.history.replaceState(event.state,'',window.location.origin + window.location.pathname + window.location.search);
      this.visible();
    },
    initVideoWidthStyle() {
      const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      if(screenWidth>  991 ){
          if(screenHeight *4/3 > screenWidth){
            this.videoWidthStyle = 'width:90vw;';
          }else{
            this.videoWidthStyle = 'width:100vh;';
          }
        }else{
            this.videoWidthStyle = 'width:100vw;';
        }
    },
    reloadLocation(e){
      // console.log(e.target.innerWidth >  991 && (e.target.innerHeight*4) / 3 > e.target.innerWidth);
      if(this.imgType==='picture'){
        this.initImgMsg(this.imgI);
        this.reset();
      }else{
        this.initVideoWidthStyle();
        this.initVideoMsg(this.imgI);
      }
    },
    handleKeyDown(event) {
      // 检查按下的键是否是 Esc 键
      if (event.key === "Escape") {
        // 关闭弹窗的逻辑
        this.modelClose();
      }
      else if (event.key === 'ArrowUp') {
        // console.log('向上键被按下');
      } else if (event.key === 'ArrowDown') {
        // console.log('向下键被按下');
      }
      else if (event.key === 'ArrowLeft') {
        this.prevImg();
      } else if (event.key === 'ArrowRight') {
        this.nextImg();
      }
    },
    clickPreview(e) {
      // console.log(e.target instanceof HTMLImageElement);
      if (e.target === this.$refs.toolBar || e.target === this.$refs.imgPreview) this.modelClose();
      // if (!(e.target instanceof HTMLImageElement)) {
      //   console.log('点击无内容区域');
      //   // this.visible();
      // }
    },
    modelClose(){
      this.visible();
      if(this.isMobile) window.history.go(-1);
      
    },
    cleanData() {
      this.rotateDeg = 0; // 旋转角度
      // this.preImgData= '';//预加载后图片的数组
      // this.imgSrc = ''; // 预览图片的src
      this.videoRatio = '4:3';
      this.videoFile = {}
      this.imgType = '';
      this.scaleSize = 0;//缩放系数
      this.imgName = 'loading error';//图片名
      this.imgWidth = 0;//图片的宽度
      this.imgHeight = 0;//图片的高度
      this.imgw = 0;//图片的clientWidth
      this.imgh = 0;//图片的clientHeight
      this.imgContainerWidth = 0;//图片容器的clientHeight
      this.imgContainerHeight = 0;//图片容器的clientHeight
      this.videoWidthStyle = '';
      this.startDrag = false;
      this.touchTime = 0;
      this.touchDouble = false;
      this.scaleShow = false;
      // this.imgDataListLength= 0; // 数组的长度
      // this.snapImgIndex= 0;
    },
    setData(viewerVisible, imgIndex, imgDataList) {
      this.viewerVisibleShow = viewerVisible;
      this.imgI = imgIndex;
      this.imgData = imgDataList;
    },
    visible() {
      // 重置数据
      this.cleanData();
      setTimeout(() => { this.viewerVisibleShow = false; }, 0)
    },
    getOffset(e) {
      let left = 0,
        top = 0
      while (e != null && e != document.body) {
        top += e.offsetTop
        left += e.offsetLeft
        e = e.offsetParent
      }
      return {
        left: left,
        top: top
      }
    },
    throttle(func, wait) {
      let timeout = null;
      let that = this;
      return function () {
        let context = that;
        let args = arguments;
        if (!timeout) {
          timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args)
          }, wait)
        }

      }
    },
    triggerScaleTips(){
      if(!this.viewerVisibleShow) return;
        const self = this;
        this.scaleShow  = true;
        if(this.scaleShowTimer){
          clearTimeout(this.scaleShowTimer);
        }
        this.scaleShowTimer = setTimeout(()=>{
          self.scaleShow = false;
        },600);
    },
    moveupError() {
      this.locationData.isMove = false;
      this.visible();
    },
    moveUpOthers(e) {
      this.locationData.isMove = false;
      this.mouseup(e);
    },
    mousedown(e) {
      // const timerDown = new Date().getTime();
      // console.log('mousedown',timerDown);
      if (e.which === 1 && e.target && e.target === this.imgElement) {
        this.locationData.isMove = true;
        // console.log('down')
        // this.imgStyle.cursor = 'move';
        this.locationData.startX = e.clientX;
        this.locationData.startY = e.clientY;
        e.preventDefault();
        if(this.$refs && this.$refs.titleBar && this.$refs.toolBar){
          this.$refs.titleBar.addEventListener('mouseup', this.moveupError);
          this.$refs.toolBar.addEventListener('mouseup', this.moveUpOthers);
        }
        if(this.$refs && this.$refs.preCover && this.$refs.nextCover){
          this.$refs.preCover.addEventListener('mouseup', this.moveUpOthers);
          this.$refs.nextCover.addEventListener('mouseup', this.moveUpOthers);
        }
        

        window.addEventListener('mousemove', this.mousemove);
        window.addEventListener('mouseup', this.mouseup);

      }
    },
    removeEvent() {
      if(this.$refs && this.$refs.titleBar && this.$refs.toolBar){
        this.$refs.titleBar.removeEventListener('mouseup', this.moveupError);
        this.$refs.toolBar.removeEventListener('mouseup', this.moveUpOthers);
      }
      if(this.$refs && this.$refs.preCover && this.$refs.nextCover){
          this.$refs.preCover.removeEventListener('mouseup', this.moveUpOthers);
          this.$refs.nextCover.removeEventListener('mouseup', this.moveUpOthers);
        }
        window.removeEventListener('mouseup', this.mouseup);
        window.removeEventListener('mousemove', this.mousemove);
    },
    mouseup(e) {
      // const timerUp = new Date().getTime();
      // console.log('mouseup',timerUp);
      if (e.which !== 1) {
        return
      }
      this.removeEvent();
      e.preventDefault();
      if(!this.startDrag){
        this.locationData.isMove = false;
        return;
      }
      // this.imgStyle.cursor = 'default'
      this.locationData.isMove = false
      if (typeof this.locationData.imgLeft !== 'undefined' && this.startDrag) {
        // console.log('关键就爱乃案件i安吉');
        this.startDrag = false;
        this.locationData.distanceX = this.locationData.imgLeft
        this.locationData.distanceY = this.locationData.imgTop
      }
    },
    mousemove(e) {
      if (e.which !== 1) {
        return
      }
      if (this.locationData.isMove && !this.error) {
        // console.log('mousemove');
        // 触发此事件才开始拖拽图片流程
        this.startDrag = true;
        // console.log('d');
        e.preventDefault()
        // this.imgStyle.cursor = 'move';
        this.locationData.endX = e.clientX;
        this.locationData.endY = e.clientY;
        this.locationData.imgLeft = this.locationData.distanceX + this.locationData.endX - this.locationData.startX;
        this.locationData.imgTop = this.locationData.distanceY + this.locationData.endY - this.locationData.startY;
        this.imgStyle.left = this.locationData.imgLeft + 'px';
        this.imgStyle.top = this.locationData.imgTop + 'px';
      }
    },
    doubleClick(e){
      this.triggerScaleTips();
      if (e.which !== 1) {
        return
      }
      if(this.touchDouble) return;
      // console.log('doubleClick');
      let x = e.clientX
      let y = e.clientY
      e.preventDefault();
      if (e.target && this.error === false && e.target === this.imgElement) {
        let l = this.getOffset(this.imgContainer)
        x = x - l.left
        y = y - l.top

        let scaleNum = this.locationData.isDoubleClick ? 0.5 : 2;
        let snapScaleSize = this.scaleSize * scaleNum //暂存缩放系数
        // snapScaleSize += scaleNum
        snapScaleSize =
          snapScaleSize < 0.1 ?
            0.1 :
            snapScaleSize > 1000 ?
              1000 :
              snapScaleSize //可以缩小到0.1,放大到1000倍
        //计算位置，以鼠标所在位置为中心
        //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
        this.locationData.distanceX =
          this.locationData.distanceX -
          ((x - this.locationData.distanceX) * (snapScaleSize - this.scaleSize)) / this.scaleSize
        this.locationData.distanceY =
          this.locationData.distanceY -
          ((y - this.locationData.distanceY) * (snapScaleSize - this.scaleSize)) / this.scaleSize
        this.scaleSize = snapScaleSize //更新倍率
        //改变位置和大小
        // this.imgStyle.transition='all 0.2s ease'

        this.imgStyle.width = this.imgw * snapScaleSize + 'px'
        this.imgStyle.height = this.imgh * snapScaleSize + 'px'
        this.imgStyle.top = this.locationData.distanceY + 'px'
        this.imgStyle.left = this.locationData.distanceX + 'px'
        this.locationData.isDoubleClick = !this.locationData.isDoubleClick;

      }
    },
    touchStart(event) {
      // console.log(event);
      if(event.which !== 0) return;
      event.preventDefault()
      if(event.touches.length===2){
        this.touchData.isScale = true;
        // 双指缩放
        const point1 = event.touches[0];
        const point2 = event.touches[1];
        this.touchData.startX = [point1.pageX,point2.pageX,point1.clientX,point2.clientX];
        this.touchData.startY = [point1.pageY,point2.pageY,point1.clientY,point2.clientY];
        this.touchData.imgMoveWidth = this.scaleSize * this.imgw;
        this.touchData.imgMoveHeight = this.scaleSize * this.imgh;
      } else if(event.touches.length===1){
        let time = this.touchTime;
        // if (this.touchTime === 0) {
        //   delta = 0;
        // } else {
        //   delta = Date.now() - this.touchTime;
        // }
        const delta = Date.now() - time;
        this.touchTime = Date.now();
        if (delta > 0 && delta <= 250) {
          // 双击
          // console.log('doubleStat');
          this.touchDouble = true;
        } else {
          this.touchDouble = false;
          // 单指拖动
          if (event.target && event.target === this.imgElement) {
            this.locationData.isMove = true;
            this.locationData.startX = event.touches[0].clientX;
            this.locationData.startY = event.touches[0].clientY;
          }
        }

      }
    },
    touchMove(event) {
      // console.log(event);
      if(event.which !== 0) return;
      event.preventDefault()
      if(event.touches.length===2 && this.touchData.isScale){
        if(this.startDrag){
          this.locationData.isMove = false;
          this.startDrag =false;
          this.locationData.distanceX = this.locationData.imgLeft
          this.locationData.distanceY = this.locationData.imgTop
        }
        const point1 = event.touches[0];
        const point2 = event.touches[1];
        // 按照开始的中心进行计算
        let x = (this.touchData.startX[2] + this.touchData.startX[3]) / 2
        let y = (this.touchData.startY[2] + this.touchData.startY[3]) / 2
        let l = this.getOffset(this.imgContainer)
        const x1 = this.touchData.startX[0];
        const x2 = this.touchData.startX[1];
        const y1 = this.touchData.startY[0];
        const y2 = this.touchData.startY[1];
        const x3 = point1.pageX;
        const x4 = point2.pageX;
        const y3 = point1.pageY;
        const y4 = point2.pageY;
        const distanceStart = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
        const distanceEnd = Math.sqrt((x3 - x4) * (x3 - x4) + (y3 - y4) * (y3 - y4))
        x = x - l.left
        y = y - l.top
        let snapScaleSize = distanceEnd / distanceStart
        if (this.scaleSize > 1000 && snapScaleSize > 1) return;
        if (this.scaleSize < 0.1 && snapScaleSize < 1) return;
        const snapScaleSizeT = (snapScaleSize * this.touchData.imgMoveWidth) / this.imgw;
        this.locationData.distanceX = this.locationData.distanceX - ((x - this.locationData.distanceX) * (snapScaleSizeT - this.scaleSize)) / this.scaleSize
        this.locationData.distanceY = this.locationData.distanceY - ((y - this.locationData.distanceY) * (snapScaleSizeT - this.scaleSize)) / this.scaleSize
        this.scaleSize = (this.touchData.imgMoveWidth * snapScaleSize) / this.imgw //更新倍率
        this.imgStyle.width = this.touchData.imgMoveWidth * snapScaleSize + 'px'
        this.imgStyle.height = this.touchData.imgMoveHeight * snapScaleSize + 'px'
        this.imgStyle.top = this.locationData.distanceY + 'px'
        this.imgStyle.left = this.locationData.distanceX + 'px'
        this.locationData.imgLeft = this.locationData.distanceX;
        this.locationData.imgTop = this.locationData.distanceY;
        this.locationData.isDoubleClick = false;
        this.triggerScaleTips();
      }else if(event.touches.length===1){
        if (this.locationData.isMove && !this.error) {
        // 触发此事件才开始拖拽图片流程
        this.startDrag = true;
        this.locationData.endX = event.touches[0].clientX;
        this.locationData.endY = event.touches[0].clientY;
        this.locationData.imgLeft = this.locationData.distanceX + this.locationData.endX - this.locationData.startX;
        this.locationData.imgTop = this.locationData.distanceY + this.locationData.endY - this.locationData.startY;
        this.imgStyle.left = this.locationData.imgLeft + 'px';
        this.imgStyle.top = this.locationData.imgTop + 'px';
      }
      }
    },
    touchEnd(event) {
      if (event.which !== 0) return;
      event.preventDefault();
      // console.log('=============touchEnd=======================');
      // console.log(event);
      // console.log('====================================');
      if (this.touchDouble) {
        this.triggerScaleTips();
        // console.log('touchDouble');
        let x = event.changedTouches[0].clientX
        let y = event.changedTouches[0].clientY
        if (event.target && this.error === false && event.target === this.imgElement) {
          let l = this.getOffset(this.imgContainer)
          x = x - l.left
          y = y - l.top

          let scaleNum = this.locationData.isDoubleClick ? 0.5 : 2;
          let snapScaleSize = this.scaleSize * scaleNum//暂存缩放系数
          // snapScaleSize += scaleNum
          snapScaleSize =
            snapScaleSize < 0.1 ?
              0.1 :
              snapScaleSize > 1000 ?
                1000 :
                snapScaleSize //可以缩小到0.1,放大到1000倍
          //计算位置，以鼠标所在位置为中心
          //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
          this.locationData.distanceX =
            this.locationData.distanceX -
            ((x - this.locationData.distanceX) * (snapScaleSize - this.scaleSize)) / this.scaleSize
          this.locationData.distanceY =
            this.locationData.distanceY -
            ((y - this.locationData.distanceY) * (snapScaleSize - this.scaleSize)) / this.scaleSize
          this.scaleSize = snapScaleSize //更新倍率
          //改变位置和大小
          // this.imgStyle.transition='all 0.2s ease'

          this.imgStyle.width = this.imgw * snapScaleSize + 'px'
          this.imgStyle.height = this.imgh * snapScaleSize + 'px'
          this.imgStyle.top = this.locationData.distanceY + 'px'
          this.imgStyle.left = this.locationData.distanceX + 'px'
          this.locationData.isDoubleClick = !this.locationData.isDoubleClick;

        }
      } else {
        this.touchData.isScale = false;
        if (!this.startDrag) {
          this.locationData.isMove = false;
          return;
        }
        this.locationData.isMove = false
        if (typeof this.locationData.imgLeft !== 'undefined' && this.startDrag) {
          // console.log('手机收手机');
          this.startDrag = false;
          this.locationData.distanceX = this.locationData.imgLeft
          this.locationData.distanceY = this.locationData.imgTop
        }
      }
    },
    mousewheel(e) {
      this.triggerScaleTips();
      // console.log('滚动',e)
      if(this.scaleSize>1000 && e.wheelDelta>0) return;
      if(this.scaleSize<0.1 && e.wheelDelta<0) return;
      if(this.startDrag){
        this.locationData.isMove = false;
        this.startDrag =false;
        this.locationData.distanceX = this.locationData.imgLeft
        this.locationData.distanceY = this.locationData.imgTop
      }
      this.wheelData.imgWheelWidth = this.scaleSize * this.imgw;
      this.wheelData.imgWheelHeight = this.scaleSize * this.imgh;
      //以鼠标为中心缩放，同时进行位置调整
      // let deltaY = 0
      let x = e.clientX
      let y = e.clientY
      // e.preventDefault();
      if (e.target && this.error === false && e.target === this.imgElement) {
        let l = this.getOffset(this.imgContainer)
        x = x - l.left
        y = y - l.top

        // let scaleNum = e.wheelDelta / 1200
        // let snapScaleSize = this.scaleSize //暂存缩放系数
        // snapScaleSize += scaleNum
        // snapScaleSize =
        //   snapScaleSize < 0.2 ?
        //     0.2 :
        //     snapScaleSize > 10 ?
        //       10 :
        //       snapScaleSize //可以缩小到0.2,放大到10倍
        // //计算位置，以鼠标所在位置为中心
        // //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
        // this.locationData.distanceX =
        //   this.locationData.distanceX -
        //   ((x - this.locationData.distanceX) * (snapScaleSize - this.scaleSize)) / this.scaleSize
        // this.locationData.distanceY =
        //   this.locationData.distanceY -
        //   ((y - this.locationData.distanceY) * (snapScaleSize - this.scaleSize)) / this.scaleSize
        // this.scaleSize = snapScaleSize //更新倍率
        // //改变位置和大小
        // // this.imgStyle.transition='all 0.2s ease'

        // this.imgStyle.width = this.imgw * snapScaleSize + 'px'
        // this.imgStyle.height = this.imgh * snapScaleSize + 'px'
        // this.imgStyle.top = this.locationData.distanceY + 'px'
        // this.imgStyle.left = this.locationData.distanceX + 'px'
        // this.locationData.isDoubleClick = false;
        let scaleNum = e.wheelDelta / 1200
        let snapScaleSize = 1 + scaleNum//暂存缩放系数
        let snapScaleSizeT = this.wheelData.imgWheelWidth * snapScaleSize/this.imgw
        // snapScaleSize += scaleNum
        // snapScaleSize =
        //   snapScaleSize < 0.2 ?
        //     0.2 :
        //     snapScaleSize > 10 ?
        //       10 :
        //       snapScaleSize //可以缩小到0.2,放大到10倍
        //计算位置，以鼠标所在位置为中心
        //以每个点的x、y位置，计算其相对于图片的位置，再计算其相对放大后的图片的位置
        this.locationData.distanceX =
          this.locationData.distanceX -
          ((x - this.locationData.distanceX) * (snapScaleSizeT - this.scaleSize)) / this.scaleSize
        this.locationData.distanceY =
          this.locationData.distanceY -
          ((y - this.locationData.distanceY) * (snapScaleSizeT - this.scaleSize)) / this.scaleSize
        this.scaleSize = snapScaleSizeT //更新倍率
        this.imgStyle.width = this.wheelData.imgWheelWidth * snapScaleSize + 'px'
        this.imgStyle.height = this.wheelData.imgWheelHeight * snapScaleSize + 'px'
        this.imgStyle.top = this.locationData.distanceY + 'px'
        this.imgStyle.left = this.locationData.distanceX + 'px'
        this.locationData.isDoubleClick = false;

      }
    },
    stopEvent(e) {
      //等会处理节流
      e.preventDefault();
    },
    rotateImg() {
      // console.log('旋转');
      if (this.error === false) {
        this.rotateDeg = this.rotateDeg >= 360 ? 90 : this.rotateDeg + 90;
        this.imgStyle.transform = 'rotate(' + this.rotateDeg + 'deg)';
        // this.imgStyle.transition='all 0.5s ease'
      } else {
        return false;
      }

    },
    reset() {
      if(this.imgType!=='picture') return;

      var pW, pH;//imgContainer的宽高暂存值
      // 以完全显示图片为基准,如果改为>，则为以铺满屏幕为基准
      // 我设置的默认为<即img宽度填充imgContainer
      this.locationData.isDoubleClick = false;
      if (this.imgContainerWidth / this.imgContainerHeight < this.imgw / this.imgh) {
        pW = this.imgContainerWidth
        pH = (this.imgh * this.imgContainerWidth) / this.imgw
        this.locationData.distanceX = 0
        this.locationData.distanceY = -(pH - this.imgContainerHeight) / 2
        this.scaleSize = this.imgContainerWidth / this.imgw //初始比率
      } else {
        pW = (this.imgw * this.imgContainerHeight) / this.imgh
        pH = this.imgContainerHeight
        this.locationData.distanceX = -(pW - this.imgContainerWidth) / 2
        this.locationData.distanceY = 0
        this.scaleSize = this.imgContainerHeight / this.imgh
      }
      //重置图片的大小，位置
      this.imgStyle.width = pW + 'px'
      this.imgStyle.height = pH + 'px'
      this.imgStyle.left = this.locationData.distanceX + 'px'
      this.imgStyle.top = this.locationData.distanceY + 'px'
      // 重置角度
      if (this.rotateDeg === 0) {
        this.rotateDeg = 0;
      } else if (this.rotateDeg === 90) {
        this.rotateDeg = 360;
      } else if (this.rotateDeg === 180) {
        this.rotateDeg = 360;
      } else if (this.rotateDeg === 270) {
        this.rotateDeg = 360;
      } else {
        this.rotateDeg = 0;
      }
      this.imgStyle.transform = 'rotate(' + this.rotateDeg + 'deg)';
    },
    prevImg() {
      if (this.imgI === 0) {
        this.reset();
        return;
      } else {
        this.cleanData();
        this.changeLoading(true);
        setTimeout(() => {
          this.imgDataListLength = this.imgData.length;
          // const imgDataNext = this.preloadImgData;
          const indexNext = this.imgI;
          this.init(indexNext - 1);
          this.imgI -= 1;

        }, 0);

      }
    },
    nextImg() {
      let imgDataLength = this.imgData.length;
      if (this.imgI === imgDataLength - 1) {
        this.reset();
        return;
      } else {
        this.cleanData();
        this.changeLoading(true);
        setTimeout(() => {
          this.imgDataListLength = this.imgData.length;
          // const imgDataNext= this.preloadImgData;
          const indexNext = this.imgI;
          this.init(indexNext + 1);
          this.imgI += 1;
        }, 0);

      }

    },
    init(index) {
      this.changeLoading(true);
      this.setPreviewImg(index);
    },
    initImgMsg(index) {
      if (this.preloadImgData[index].error === true) {
        this.error = true;
        //处理图片加载错误，点击重试
        this.retry();
      } else {
        this.error = false;
        //清除图片重试点击事件
        this.cleanRetry();
      }
      // 获取屏幕的宽度和高度
      const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

      // 计算原始比例
      const aspectRatio = this.preloadImgData[index].width / this.preloadImgData[index].height;

      // 计算容器的最大宽度和高度
      const maxContainerWidth = screenWidth * 0.85; // 85% 的屏幕宽度
      const maxContainerHeight = screenHeight * 0.85; // 85% 的屏幕高度

      
      // 计算容器的实际宽度和高度
      this.imgContainerWidth = Math.min(this.preloadImgData[index].width , maxContainerWidth);
      this.imgContainerHeight = Math.min(this.preloadImgData[index].height , maxContainerHeight);

      // 按原始比例减小图片的宽度和高度
      if (this.imgContainerWidth / this.imgContainerHeight > aspectRatio) {
        this.imgWidth = this.imgContainerHeight * aspectRatio;
        this.imgHeight = this.imgContainerHeight;
      } else {
        this.imgWidth = this.imgContainerWidth;
        this.imgHeight = this.imgContainerWidth / aspectRatio;
      }
      // this.imgType = this.preloadImgData[index].type;
      //初始化装载容器的宽高,为了测试，我默认设置的图片的1/4,可以自己改
      // this.imgContainerWidth = this.preloadImgData[index].width / 2;
      // this.imgContainerHeight = this.preloadImgData[index].height / 2;
      let ctop = this.imgContainerHeight / 2;
      let cleft = this.imgContainerWidth / 2;
      this.imgContainer.style.cssText = 'top:calc(50% - ' + ctop + 'px);left:calc(50% - ' + cleft + 'px)';
      //初始化图片的宽高
      // this.imgWidth = this.preloadImgData[index].width / 2;
      // this.imgHeight = this.preloadImgData[index].height / 2;
      //初始化图片的src和name
      this.imgSrc = this.preloadImgData[index].url;
      this.imgName = this.preloadImgData[index].filename;

      //初始化imgw和imgh，方便后面计算
      this.imgw = this.imgWidth;
      this.imgh = this.imgHeight;
      //初始化图片加载的错误状态
      this.snapImgIndex = index;

    },
    initVideoMsg(index) {
      if (this.preloadImgData[index].error === true) {
        this.error = true;
        //处理图片加载错误，点击重试
        // this.retry();
      } else {
        this.error = false;
        //清除图片重试点击事件
        // this.cleanRetry();
      }
      // 获取屏幕的宽度和高度
      // const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      // const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

      // // 计算原始比例
      // const aspectRatio = this.videoElement.clientWidth / this.videoElement.clientHeight;

      // // 计算容器的最大宽度和高度
      // const maxContainerWidth = screenWidth * 0.8; // 80% 的屏幕宽度
      // const maxContainerHeight = screenHeight * 0.8; // 80% 的屏幕高度
      //  // 计算容器的实际宽度和高度
      // let Width = Math.min(this.videoElement.clientWidth, maxContainerWidth);
      // let Height = Math.min(this.videoElement.clientHeight, maxContainerHeight);
      // let width =0
      // let height =0
      // // 按原始比例减小图片的宽度和高度
      // if (Width / Height > aspectRatio) {
      //   width = Height * aspectRatio;
      //   height = Height;
      // } else {
      //   width = Width;
      //   height = Width / aspectRatio;
      // }
      let ctop = this.videoElement.clientHeight / 2;
      let cleft = this.videoElement.clientWidth / 2;
      // console.log('====================================');
      // console.log(this.videoElement.offsetHeight ,this.videoElement.clientHeight, this.videoElement.getBoundingClientRect().height);
      // console.log('====================================');
      this.videoContainer.style.cssText = 'top:calc(50% - ' + ctop + 'px);left:calc(50% - ' + cleft + 'px)';
      this.snapImgIndex = index;

    },
    download() {
      this.getBase64(this.imgI).then((s) => {
        let aLink = document.createElement('a');
        aLink.download = s.name;
        aLink.href = s.base64;
        aLink.click();
      }).catch((err) => {
        console.log(`下载失败`, err)
      })
    },
    changeLoading(status) {
      this.loading = status;
    },
    getScreenAspectRatio() {
      const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      if( screenWidth > 991 ){
        this.videoRatio = '4:3';
        return;
      }
      // 计算宽高比
      const gcd = function(a, b) {
        return b ? gcd(b, a % b) : a;
      };
      const divisor = gcd(screenWidth, screenHeight);
      const widthRatio = screenWidth / divisor;
      const heightRatio = screenHeight / divisor;
      // 返回宽高比字符串
      this.videoRatio = `${widthRatio}:${heightRatio}`;
    },
    setPreviewImg(index) {
      this.imgType = this.imgData[index].type;
      if (this.imgData[index].type === 'video') {
        this.initVideoWidthStyle();
        this.videoFile = this.imgData[index];
        this.getScreenAspectRatio();
        this.preloadVideo(index).then(() => {
          this.initVideoMsg(index);
          // this.reset();
          this.changeLoading(false)
        }).catch((err) => {
          // console.log('eeerrrrr', err);

          this.initVideoMsg(index);
          // this.reset();
          this.changeLoading(false)
        });
      } else {
        this.preloadImg(index).then(() => {
          this.initImgMsg(index);
          this.reset();
          this.changeLoading(false)
        }).catch(() => {
          this.initImgMsg(index);
          this.reset();
          this.changeLoading(false)
        });
      }

    },
    preloadImg(index) {
      let imgData = this.imgData;
      let snapData;
      let img = new Image();
      img.src = imgData[index].url;
      return new Promise((resolve, reject) => {
        img.onload = (data) => {
          snapData = { type: 'picture', filename: imgData[index].filename || imgData[index].name || '', url: imgData[index].url, rid: imgData[index].rid||'', width: imgData[index].width||img.width, height: imgData[index].height || img.height, error: false };
          this.preloadImgData[index] = snapData;

          resolve(true);
        };

        img.onerror = () => {
          snapData = { type: 'picture', filename: 'loading error', url: '/statics/preview-model/error.png', rid: imgData[index].rid||'', width: 128, height: 128, error: true };
          this.preloadImgData[index] = snapData;

          reject(false);
        };

      })
    },
    preloadVideo(index) {
      const self = this;
      let imgData = this.imgData;
      let snapData;
      return new Promise((resolve, reject) => {
        setTimeout(()=>{
          snapData = { ...imgData[index], error: false };
          self.preloadImgData[index] = snapData;
          resolve(true);
        },100);
      })
    },
    handleRetry() {
      this.init(this.snapImgIndex);
    },
    cleanRetry() {
      if (!this.imgElement) return;
      this.imgElement.removeEventListener('click', this.handleRetry)
    },
    retry() {
      this.cleanData();
      if (!this.imgElement) return;
      this.imgElement.addEventListener('click', this.handleRetry)
    },
    getBase64(index) {
      let img = new Image();
      let base64;
      let name;
      let base64Array;
      let canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.src = this.preloadImgData[index].url;
      // img.crossOrigin="anonymous";
      return new Promise((resolve, reject) => {
        if (this.preloadImgData[index].error !== true) {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            base64 = canvas.toDataURL('image/jpeg');
            name = this.preloadImgData[index].filename;
            base64Array = {
              base64: base64,
              name: name,
            }
            resolve(base64Array)
          };
          img.onerror = () => {
            reject(false)
          };

        } else { reject(false) }
      })

    },
  }
}
</script>
