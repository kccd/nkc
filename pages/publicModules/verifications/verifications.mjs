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
        vernierCaliper: {
          init: false,
          answer: 0,
          data: {
            question: '',
            backgroundColor: '',
            mainImageBase64: '',
            secondaryImageBase64: ''
          }
        }
      },
      methods: {
        getData() {
          return nkcAPI(`/verifications`, 'GET')
            .then(data => {
              self.app.type = data.verificationData.type;
              self.app[self.app.type].data = data.verificationData;
              const initFunc = self.app[`${self.app.type}Init`];
              if(initFunc) initFunc();
            })
            .catch(err => {
              console.log(err);
              sweetError(err);
            });
        },
        open() {
          this.getData()
            .then(() => {
              self.dom.modal('show');
            })
        },
        close() {
          self.dom.modal('hide');
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

          }, 300);
        },
        submit() {
          const {data: verificationData, answer} = this[this.type];
          verificationData.answer = answer;
          nkcAPI(`/verifications`, 'POST', {
            verificationData
          })
            .then(() => {
              self.callback({
                verificationData
              });
              self.close();
            })
            .catch(err => {
              console.log(err);
              screenTopWarning(err);
              self.app.getData();
            });
        }
      },
    });
  }
  open(callback) {
    this.callback = callback;
    this.app.open();
  }
  close() {
    this.app.close();
  }
}


NKC.modules.Verifications = Verifications;
