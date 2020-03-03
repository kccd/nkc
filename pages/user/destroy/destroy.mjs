const data = NKC.methods.getDataById("data");
const app = new Vue({
  el: "#app",
  data: {
    verifyEmail: data.verifyEmail,
    verifyMobile: data.verifyMobile,
    verifyPassword: data.verifyPassword,

    nationCodes: window.nationCodes,
    nationCode: "86",
    mobile: "",
    email: "",
    mobileCode: "",
    emailCode: "",
    password: "",

    passed: (!data.verifyEmail && !data.verifyMobile && !data.verifyPassword)
  },
  methods: {
    verify() {
      const self = this;
      const {nationCode, mobile, email, emailCode, mobileCode, password} = this;
      nkcAPI(`/u/${NKC.configs.uid}/destroy`, "POST", {
        type: "verify",
        form: {
          nationCode,
          mobile,
          email,
          emailCode,
          mobileCode,
          password
        }
      })
        .then(() => {
          self.passed = true;
        })
        .catch(sweetError)
    },
    submit() {
      nkcAPI(`/u/${NKC.configs.uid}/destroy`, "POST", {
        type: "destroy"
      })
        .then(() => {
          // 注销完成
        })
        .catch(sweetError);
    }
  }
});