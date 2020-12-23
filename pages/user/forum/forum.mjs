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
    function({ enterInfo }) {
      return enterInfo.newForumName && enterInfo.reason && enterInfo.youWantToDo
        ? {passed: true}
        : {passed: false, message: "请先完整填写"}
    }
  ],
  ["send_invite",  // 发送邀请
    function(vm) {
      let sendInvite = vm.sendInvite;
      if(sendInvite.userId.length < 3) {
        return {passed: false, message: "至少选择3个人"}
      } else {
        vm.commitData();
        return {passed: true}
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
    process: true,
    myPForums: data.myPForums,
    reviewNewForumGuide: data.reviewNewForumGuide
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
      return nkcAPI(`/u/${NKC.configs.uid}/forum`, "POST", {info: enterInfo, invites: sendInvite.userId})
        .then(() => {
          console.log("提交成功");
          self.process = false;
        })
        .catch(sweetError);
    }
  }
})


// 选择用户组件
const selectUserModule = new NKC.modules.SelectUser();
