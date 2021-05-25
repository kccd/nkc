import Vue from "vue";
import { Datetime } from "vue-datetime";
import "vue-datetime/dist/vue-datetime.css";

Vue.component("datetime", Datetime);

const DEFAULT_IMAGE = "/default/photo_setting.jpg";
const _data = JSON.parse($("#data").text());
const authenticate = _data.authenticate;
const expiryDate1 = new Date(authenticate.card.expiryDate);
const expiryDate2 = new Date(authenticate.video.expiryDate);
authenticate.card.expiryDate = `${expiryDate1.getFullYear()}年${expiryDate1.getMonth() + 1}月${expiryDate1.getDate()}日`;
authenticate.video.expiryDate = `${expiryDate2.getFullYear()}年${expiryDate2.getMonth() + 1}月${expiryDate2.getDate()}日`;
console.log(authenticate);

new Vue({
	el: "#app",
	data: {
		authenticate: _data.authenticate,
		verify2form: {
			status: "passed",
			expiredDate: "",
			message: ""
		},
		verify3form: {
			status: "passed",
			expiredDate: "",
			message: ""
		}
	},
	computed: {
		IDCardA() {
			const aid = this.authenticate.card.attachments[0];
			return aid && ["in_review", "passed"].includes(this.authenticate.card.status)
				? `/a/${aid}`
				: DEFAULT_IMAGE;
		},
		IDCardB() {
			const aid = this.authenticate.card.attachments[1];
			return aid && ["in_review", "passed"].includes(this.authenticate.card.status)
				? `/a/${aid}`
				: DEFAULT_IMAGE;
		},
		video() {
			const aid = this.authenticate.video.attachments[0];
			return aid && ["in_review", "passed"].includes(this.authenticate.video.status)
				? `/a/${aid}`
				: DEFAULT_IMAGE;
		}
	},
	methods: {
		async verify2Submit() {
			try {
				await nkcAPI("./auth/verify2", "POST", this.verify2form);
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		},
		async verify3Submit() {
			try {
				await nkcAPI("./auth/verify3", "POST", this.verify3form);
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		},
		async revokeVerify(level) {
			try {
				await sweetConfirm("你确定要撤销认证？");
				await nkcAPI(`./auth?level=${level}`, "DELETE");
				await sweetSuccess("执行成功");
			} catch (error) {
				return sweetError(error);
			}
			location.reload();
		}
	}
});
