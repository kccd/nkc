let data = NKC.methods.getDataById("data");

const stepCheckerMap = new Map([
  ["protocol",    // 开办指南
    function({ protocol }) {
      return protocol.haveReadProtocol
        ? {passed:true}
        : {passed:false, message: "请先仔细阅读开办指南"}
    }
  ],
  ["enter_info",   // 录入信息
    function(vm) {
      let { enterInfo, sendInvite } = vm;
      if(!enterInfo.newForumName || !enterInfo.reason || !enterInfo.youWantToDo) {
        return {passed: false, message: "请先完整填写"}
      }
      if(sendInvite.userId.length < 3) {
        return {passed: false, message: "请至少选择3个人作为专业共同创始人"}
      } else {
        vm.commitData();
      }
    }
  ],
  ["sucess_section",  // 提交成功提示
    function(vm) {

    }
  ]
])

const stepNames = Array.from(stepCheckerMap.keys());

new Vue({
  el: "#app",
  data: {
    step: 0,
    protocol: {
      haveReadProtocol: false,
    },
    enterInfo: {
      newForumName: "",
      reason: "",
      youWantToDo: ""
    },
    sendInvite: {
      userId: [],
      users: []
    },
    appliedForums: data.appliedForums,
    reviewNewForumGuide: data.reviewNewForumGuide,
    buttonName: "提交",
    submitting: false
  },
  computed: {
    stepName() {
      return stepNames[this.step] || stepNames[0];
    }
  },
  methods: {
    toStep(index) {
      let { checker, stepName } = this;
      let { passed, message } = checker(stepName);
      return passed
        ? this.step = index
        : sweetError(message);
    },
    checker(stepName) {
      let vm = this;
      if(stepCheckerMap.has(stepName)) {
        let stepChecker = stepCheckerMap.get(stepName);
        return typeof stepChecker === "function"
          ? stepChecker(vm)
          : {}
      }
      return {};
    },
    selectUsers() {
      let self = this;
      selectUserModule.open((data) => {
        const {users} = data;
        for(const user of users) {
          const {uid, username, avatar} = user;
          if(self.sendInvite.userId.includes(uid)) continue;
          self.sendInvite.users.push({
            username,
            avatarUrl: NKC.methods.tools.getUrl('userAvatar', avatar),
            uid
          });
          self.sendInvite.userId.push(uid);
        }
      }, {userCount: 99})
    },
    deleteFounder(index) {
      this.sendInvite.users.splice(index, 1);
      this.sendInvite.userId.splice(index, 1);
    },
    commitData() {
      let { enterInfo, sendInvite } = this;
      let self = this;
      self.buttonName = "提交中...";
      self.submitting = true;
      return nkcAPI(`/u/${NKC.configs.uid}/forum/apply`, "POST", {info: enterInfo, invites: sendInvite.userId})
        .then(() => {
          console.log("提交成功");
          self.buttonName = "提交";
          self.submitting = false;
          self.step = 2;
        })
        .catch((data) => {
          self.step = 1;
          sweetError(data);
        })
        .finally(() => {
          self.buttonName = "提交";
          self.submitting = false;
        })
    }
  }
})


// 选择用户组件
const selectUserModule = new NKC.modules.SelectUser();

