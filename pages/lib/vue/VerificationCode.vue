<template lang="pug">

    mixin buttons
      .button-content
        .pull-left
          button.btn.btn-default.btn-sm(@click='getData') 重置
        .pull-right
          button.btn.btn-default.btn-sm(@click='close') 关闭
          button.btn.btn-primary.btn-sm.m-l-05(@click='submit' v-if='type !== "error"') 确定
  
    mixin vernierCaliper
      .vernier-caliper
        .canvasCode 
            p 请输入图片的最终结果
            .canvasBox
                img(:src='codeImageData.imagData')
                input(type="text")
        //- .question 请拖动副尺使游标卡尺读数为
        //-   span &nbsp;{{vernierCaliper.data.question}}
        //- .images
        //-   .main-image(:style='"background-color: " + vernierCaliper.data.backgroundColor')
        //-     img(:src='vernierCaliper.data.mainImageBase64')
        //-   .secondary-image(ref='button' :style='"background-color: " + vernierCaliper.data.backgroundColor')
        //-     div(
        //-       :style='"background-image: url(\'" + vernierCaliper.data.secondaryImageBase64 + "\');left: " + vernierCaliper.answer + "px;"'
        //-     )
        //-     span.fa.fa-long-arrow-left.left(ref='moveLeft')
        //-     span.fa.fa-long-arrow-right.right(ref='moveRight')
        //-     //img(:src='vernierCaliper.data.secondaryImageBase64'
        //-       //:style='"margin-left: " + (vernierCaliper.left) + "px;"')
        +buttons
  
    mixin touchCaptcha
      .touch-captcha
        .question 请依次点击
          span &nbsp;{{touchCaptcha.data.question.join("、")}}
        .images
          .touch-captcha-image
            img(:src='touchCaptcha.data.image.base64' draggable="false" @click="touchCaptchaClick($event)")
            .touch-captcha-user-point(v-for="(point, index) of touchCaptcha.answer" :style="'left: '+ (point.x - 10) +'px;top: '+ (point.y - 10) +'px'")
              span.user-point-index {{index + 1}}
        +buttons
  
    mixin error
      .vernier-caliper.error
        .text-center 加载失败
        .error-content
          | {{error || '加载失败，请重试'}}
        +buttons
  
  
    .modal.fade.module-verifications(tabindex="-1" role="dialog" aria-labelledby="myModalLabel")
      .modal-dialog.modal-sm(role="document")
      +vernierCaliper
        //- div(v-if='type === "vernierCaliper"')
        //-   +vernierCaliper
        //- div(v-else-if='type === "touchCaptcha"')
        //-   +touchCaptcha
        //- div(v-else-if='type === "error"')
        //-   +error
        //- div(v-else)
        //-   .loading.vernier-caliper
        //-     .fa.fa-remove.loading-close(@click='close')
        //-     | 加载中...
        //-     .fa.fa-spinner.fa-spin
  </template>
  <style lang="less">
    .module-verifications {
      z-index: 1150;
      background-color: rgba(0,0,0,0.5);
      .modal-dialog{
        margin: auto;
        margin-top: 4rem;
      }
      .vernier-caliper,
      .touch-captcha{
        width: 320px;
        user-select: none;
        padding: 0 10px;
        overflow: hidden;
        border-radius: 3px;
        background-color: #fff;
        text-align: center;
        margin: auto;
        .main-image, .secondary-image{
          width: 300px;
          overflow: hidden;
          height: 40px;
          display: inline-block;
          position: relative;
          div{
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
          }
        }
        .main-image{
          margin-bottom: 1px;
        }
        .question{
          font-size: 1.3rem;
          text-align: left;
          padding: 2rem 1rem;
          //margin-bottom: 2rem;
          span{
            font-weight: 700;
          }
        }
        .canvasCode{
            /* h2{
              height: 80px;  
            } */
            /* display: flex;
            justify-content: space-around;
            align-items: center; */
            margin: 30px 0px;
            .canvasBox{
                margin: 40px 0px;
                display: flex;
                justify-content: space-around;
                input {
                    text-align: center; 
                    width: 50px;  
                    /* margin-top: 10px; */
                    height: 40px;
                    border: solid 1px #eee;
                    border-radius: 4px;
                    outline: none;
                    :focus{
                        /* caret-color: #2b90d9; */
                        border: solid 1px #2b90d9;
                        /* outline: solid 1px #2b90d9; */
                    }
            }
            }
            
        }
        .images{
          margin-bottom: 1rem;
          font-size: 0;
          .touch-captcha-image {
            position: relative;
            width: 100%;
            img {
              width: 100%;
            }
            .touch-captcha-user-point {
              position: absolute;
              top: 0;
              left: 0;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background-color: rgb(202, 202, 202);
              box-shadow: 5px 5px 10px 0 #383838;
              &::after {
                content: "";
                display: block;
                width: 14px;
                height: 14px;
                position: absolute;
                left: 4px;
                top: 4px;
                z-index: 9;
                background-color: green;
                border-radius: 50%;
              }
              .user-point-index {
                font-size: 12px;
                color: white;
                display: block;
                position: absolute;
                left: 0px;
                top: 0px;
                right: 0;
                bottom: 0;
                z-index: 10;
                line-height: 22px;
                text-align: center;
              }
            }
          }
        }
        .secondary-image{
          position: relative;
          cursor: all-scroll;
          .fa{
            position: absolute;
            font-size: 1.6rem;
            color: #666;
            bottom: 0;
            cursor: pointer;
            height: 1.4rem;
            width: 1.4rem;
            text-align: center;
            line-height: 1.4rem;
          }
          .left{
            left: 5px;
          }
          .right{
            right: 5px;
          }
        }
      }
      .button-content{
        overflow: hidden;
        padding: 1rem 0;
      }
      .error{
        .text-center{
          color: #e43b3b;
          font-size: 1.3rem;
          margin: 3rem 0 1rem 0;
        }
        .error-content{
          overflow-y: auto;
          padding-bottom: 2rem;
        }
      }
      .loading{
        text-align: center;
        line-height: 10rem;
        background-color: #fff;
        position: relative;
        .loading-close{
          position: absolute;
          line-height: 3rem;
          font-size: 1.3rem;
          text-align: center;
          top: 0;
          right: 0;
          height: 3rem;
          width: 3rem;
          color: #333;
          &:hover{
            background-color: red;
            color: #fff;
          }
        }
      }
    }
  </style>
  
  <script>
    import {screenTopWarning} from '../js/topAlert';
    export default {
      data: () => ({
        type: '',
        error: '',
  
        callback: null,
        modalDom: null,
        reject: null,
        resolve: null,
        // canvas需要的值
        // num1: 0,
		// num2: 0,
		// symbol: '+',
		// result: 0, // 计算结果
		// inputValue: '',
		// state: 'active', // 验证 成功 失败
        //
        codeImageData:{
            id:'',
            imagData:''
        },
        vernierCaliper: {
          init: false,
          answer: 0,
          data: {
            question: '',
            backgroundColor: '',
            mainImageBase64: '',
            secondaryImageBase64: ''
          }
        },
        touchCaptcha: {
          answer: [],
          data: {
            question: "",
            image: {
              base64: "",
              width: 0,
              height: 0
            }
          }
        }
      }),
      mounted() {
        this.initModal();
        //初始化操作
        // let canvas=
      },
      methods: {
        initModal() {
          this.modalDom = $(this.$el);
          this.modalDom.modal({
            show: false,
            backdrop: "static"
          });
        },
        showModalDom() {
          this.modalDom.modal('show');
        },
        hideModalDom() {
          this.modalDom.modal('hide');
        },
        open(callback) {
          const self = this;
          if(callback) {
            this.resolve = undefined;
            this.reject = undefined;
            this.callback = callback;
            this.getData(true);
          } else {
            return new Promise((resolve, reject) => {
              self.resolve = resolve;
              self.reject = reject;
              self.callback = undefined;
              self.getData(true);
            });
          }
        },
        done(res) {
          if(this.callback) {
            this.callback(undefined, res);
          } else {
            this.resolve(res);
          }
        },
        close() {
          const err = new Error('验证失败');
          if(this.callback) {
            this.callback(err);
          } else {
            this.reject(err);
          }
          this.hideModalDom();
        },
        getData(showModal = false) {
          this.error = '';
          const self = this;
          return nkcAPI(`/register/exam/code`, 'GET')
            .then(data => {
                console.log({data}) 
                // console.log(555,data);
            //   if(data.verificationData.type === 'unEnabled') {
            //     return self.done({secret: data.verificationData.type});
            //   }
              if(showModal) {
                self.showModalDom();
              }
            //   self.type = data.verificationData.type;
            //   self[self.type].data = data.verificationData;
            //   const initFunc = self[`${self.type}Init`];
            //   if(initFunc) initFunc();
            self.codeImageData={
                id:data.codeId,
                imagData:data.codeImage.mainImageBase64
            }
            })
            .catch(err => {
              console.log(err);
              // sweetError(err);
              self.error = err.error || err.message || err;
              self.type = 'error';
              if(showModal) {
                self.showModalDom();
              }
            });
        },
        vernierCaliperInit() {
          let tempLeft = 0;
          let mouseLeft = 0;
          let selected = false;
          this.vernierCaliper.answer = 0;
          if(this.vernierCaliper.init) return;
          const _this = this;
          setTimeout(() => {
            const button = _this.$refs.button;
            const getX = (e) => {
              if(e.screenX === undefined) {
                return e.touches[0].screenX;
              } else {
                return e.screenX;
              }
            };
  
            const onMouseDown = (e) => {
              // console.log(`按下`, e);
              e.preventDefault();
              mouseLeft = getX(e);
              selected = true;
            };
            const onMouseUp = (e) => {
              // console.log(`抬起`, e);
              selected = false;
              tempLeft = _this.vernierCaliper.answer;
            };
            const onMouseMove = (e) => {
              // console.log(`移动`, e);
  
              if(!selected) return;
              _this.vernierCaliper.answer = tempLeft + getX(e) - mouseLeft;
            };
            button.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
  
            button.addEventListener('touchstart', onMouseDown);
            document.addEventListener('touchmove', onMouseMove);
            document.addEventListener('touchend', onMouseUp);
  
            const {moveLeft, moveRight} = this.$refs;
            moveLeft.onclick = () => {
              _this.vernierCaliper.answer --;
              _this.vernierCaliper.tempLeft = _this.vernierCaliper.answer;
            };
            moveRight.onclick = () => {
              _this.vernierCaliper.answer ++;
              _this.vernierCaliper.tempLeft = _this.vernierCaliper.answer;
            };
  
          }, 300);
        },
        touchCaptchaInit() {
          this.touchCaptcha.answer.length = 0;
        },
        touchCaptchaClick(e) {
          let {offsetX, offsetY, target} = e;
          if(this.touchCaptcha.answer.length === 3) return;
          this.touchCaptcha.answer.push({
            x: offsetX,
            y: offsetY,
            w: target.width,
            h: target.height
          });
        },
        submit() {
          const self = this;
          const {data: verificationData, answer} = this[this.type];
          nkcAPI(`/verifications`, 'POST', {
            verificationData: {
              answer,
              _id: verificationData._id,
              type: verificationData.type
            }
          })
            .then((data) => {
              self.done({
                secret: data.secret
              });
              self.close();
            })
            .catch(err => {
              console.log(err);
              screenTopWarning(err);
              self.getData();
            });
        }
      },
    };
  </script>