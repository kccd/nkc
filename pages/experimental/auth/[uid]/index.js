import Vue from "vue";
import DatePicker from "element-ui/lib/date-picker";
import "element-ui/lib/theme-chalk/index.css";

const UID = NKC.configs.uid;
const DEFAULT_IMAGE = "/default/photo_setting.jpg";
const _data = JSON.parse($("#data").text());
const authenticate = _data.authenticate;
const expiryDate1 = new Date(authenticate.card.expiryDate);
const expiryDate2 = new Date(authenticate.video.expiryDate);
authenticate.card.expiryDate = `${expiryDate1.getFullYear()}年${expiryDate1.getMonth() + 1}月${expiryDate1.getDate()}日`;
authenticate.video.expiryDate = `${expiryDate2.getFullYear()}年${expiryDate2.getMonth() + 1}月${expiryDate2.getDate()}日`;

new Vue({
	el: "#app",
	data: {
		authenticate: _data.authenticate,
    auth3Content: _data.auth3Content,
		verify2form: {
			status: "passed",
			expiredDate: "",
			message: ""
		},
		verify3form: {
			status: "passed",
			expiredDate: "",
			message: ""
		},
		datePickerOptions: {
			disabledDate(time) {
				return time.getTime() < Date.now();
			},
			shortcuts: [{
				text: "7天后",
				onClick(picker) {
					picker.$emit('pick', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
				}
			}, {
				text: "30天后",
				onClick(picker) {
					picker.$emit('pick', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
				}
			}, {
				text: "90天后",
				onClick(picker) {
					picker.$emit('pick', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
				}
			}, {
				text: '365天后',
				onClick(picker) {
					picker.$emit('pick', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
				}
			}]
		},
	},
	computed: {
	  verifyDescription() {
	    const {auth3Content = '', authenticate} = this;
	    const {code} = authenticate.video;
      return auth3Content.replace(/{code}/ig, code);
    },
    IDCardA() {
			const vid = this.authenticate.card.attachments[0];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.card.status)
				? `/e/auth/${UID}/a/${vid}`
				: DEFAULT_IMAGE;
		},
		IDCardB() {
			const vid = this.authenticate.card.attachments[1];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.card.status)
				? `/e/auth/${UID}/a/${vid}`
				: DEFAULT_IMAGE;
		},
		video() {
			const vid = this.authenticate.video.attachments[0];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.video.status)
				? `/e/auth/${UID}/a/${vid}`
				: DEFAULT_IMAGE;
		}
	},
	methods: {
		async verify2Submit() {
			try {
				await nkcAPI(location.pathname + "/verify2", "POST", this.verify2form);
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		},
		async verify3Submit() {
			try {
				await nkcAPI(location.pathname + "/verify3", "POST", this.verify3form);
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		},
		async revokeVerify(level) {
			try {
				await sweetConfirm("你确定要撤销认证？");
				await nkcAPI(`?level=${level}`, "DELETE");
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		},
		goBack() {
			history.back();
		}
	},
	components: {
		"el-date-picker": DatePicker
	}
});
