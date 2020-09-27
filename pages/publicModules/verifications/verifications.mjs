class Verifications {
  constructor() {
    const self = this;
    self.dom = $("#moduleVerifications");
    self.dom.modal({
      show: false,
      backdrop: "static"
    });
    self.app = new Vue({
      el: '#moduleVerificationsApp',
      data: {
        type: '',
        error: '',
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
      },
      methods: {
        getData(showModal = false) {
          this.error = '';
          return nkcAPI(`/verifications`, 'GET')
            .then(data => {
              if(data.verificationData.type === 'unEnabled') {
                return self.done({secret: data.verificationData.type});
              }
              if(showModal) {
                self.dom.modal('show');
              }
              self.app.type = data.verificationData.type;
              self.app[self.app.type].data = data.verificationData;
              const initFunc = self.app[`${self.app.type}Init`];
              if(initFunc) initFunc();
            })
            .catch(err => {
              console.log(err);
              // sweetError(err);
              self.app.error = err.error || err.message || err;
              self.app.type = 'error';
              if(showModal) {
                self.dom.modal('show');
              }
            });
        },
        close() {
          self.close();
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
          let self = this;
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
          const {data: verificationData, answer} = this[this.type];
          verificationData.answer = answer;
          nkcAPI(`/verifications`, 'POST', {
            verificationData
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
            });
        }
      },
    });
  }
  open(callback) {
    if(callback) {
      this.resolve = undefined;
      this.reject = undefined;
      this.callback = callback;
      this.app.getData(true);
    } else {
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
        this.callback = undefined;
        this.app.getData(true);
      });
    }
  }
  close() {
    const err = new Error('验证失败');
    if(this.callback) {
      this.callback(err);
    } else {
      this.reject(err);
    }
    this.dom.modal('hide');
  }
  done(res) {
    if(this.callback) {
      this.callback(undefined, res);
    } else {
      this.resolve(res);
    }
  }
}


NKC.modules.Verifications = Verifications;
