import Vue from "vue";
const DEFAULT_IMAGE = "/default/photo_setting.jpg";
const UID = NKC.configs.uid;
const vm = new Vue({
	el: "#app",
	data: {
		...NKC.methods.getDataById('data').data || {},
		IDCardAInputFile: null,
		IDCardBInputFile: null,
		videoInputFile: null,
		videoCode: Math.floor(Math.random() * (9999 - 1000)) + 1000,
		loading: false,
		uploadProgress: '',
		titles: []
	},
	mounted() {},

	computed: {
		phoneNumberDesc(){
			return this.auth1Content || '暂无提示，等待管理员添加。'
		},
		identityAuthDesc() {
			return this.auth2Content || '暂无提示，等待管理员添加。'
		},
		verifyDescription() {
			let {
				videoCode,
				auth3Content = ''
			} = this;
			return auth3Content.replace(/{code}/ig, videoCode);
		},
		IDCardA() {
			if (this.IDCardAInputFile) {
				return URL.createObjectURL(this.IDCardAInputFile);
			}
			const vid = this.authenticate.card.attachments[0];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.card.status) ?
				`/u/${UID}/verifiedAssets/${vid}` :
				DEFAULT_IMAGE;
		},
		IDCardB() {
			if (this.IDCardBInputFile) {
				return URL.createObjectURL(this.IDCardBInputFile);
			}
			const vid = this.authenticate.card.attachments[1];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.card.status) ?
				`/u/${UID}/verifiedAssets/${vid}` :
				DEFAULT_IMAGE;
		},
		verify2ExpiryDate() {
			const date = new Date(this.authenticate.card.expiryDate || null);
			return date.toLocaleDateString();
		},
		video() {
			const {
				videoInputFile
			} = this;
			if (videoInputFile) {
				return URL.createObjectURL(videoInputFile);
			}
			const vid = this.authenticate.video.attachments[0];
			return vid && ["in_review", "passed", "fail"].includes(this.authenticate.video.status) ?
				`/u/${UID}/verifiedAssets/${vid}` :
				DEFAULT_IMAGE;
		},
		verify3ExpiryDate() {
			const date = new Date(this.authenticate.video.expiryDate || null);
			return date.toLocaleDateString();
		},
	},
	methods: {
		videoUpdate(file) {
			this.videoInputFile = file;
			if (file.type !== "video/mp4") {
				return sweetSuccess("视频上传成功")
			}
		},
		IDCardAInputFileChange(file) {
			this.IDCardAInputFile = file;
			console.log(file);
		},
		IDCardBInputFileChange(file) {
			this.IDCardBInputFile = file;
			console.log(file);
		},
		async submitVerify2() {
			const {
				IDCardAInputFile,
				IDCardBInputFile
			} = this;
			if (!IDCardAInputFile || !IDCardBInputFile) {
				return sweetWarning("请先选择身份证正反两面2张照片后再试");
			}
			const form = new FormData();
			form.append("surfaceA", IDCardAInputFile);
			form.append("surfaceB", IDCardBInputFile);
			try {
				await nkcUploadFile("verify/verify2_form", "POST", form).then(() => {
					return sweetSuccess("图片提交成功，请等待审核");
				});
			} catch (error) {
				return sweetError(error);
			}
			this.authenticate.card.status = "in_review";
		},
		async submiteVerify3() {
			const self = this;
			const {
				videoInputFile,
				videoCode
			} = self;
			if (!videoInputFile) {
				return sweetWarning("请先选择视频");
			}
			const form = new FormData();
			form.append("video", videoInputFile);
			form.append("code", videoCode);
			try {
				self.loading = true;
				await nkcUploadFile("verify/verify3_form", "POST", form, function (e, progress) {
					console.log(typeof progress);
					self.uploadProgress = parseInt(progress);
				}).then(() => {
					self.uploadProgress = 100;
					self.authenticate.video.status = "in_review";
					self.loading = false;
					return sweetSuccess("视频提交成功，请等待审核");
				});
			} catch (error) {
				self.loading = false;
				return sweetError(error);
			}
		}
	}
});

console.log(vm);

// $(function() {
// 	initEvent('idCardA');
// 	initEvent('idCardB');
// });

function initEvent(elementId) {
	$('#' + elementId).on('change', function () {
		var file = $('#' + elementId)[0].files[0];
		var formData = new FormData();
		formData.append('file', file);
		formData.append('photoType', elementId);
		postUpload('/photo', formData, function () {
			window.location.reload();
		});
	});
}

function submitAuth(uid, number) {
	nkcAPI('/u/' + uid + '/auth/' + number, 'POST', {})
		.then(function (data) {
			screenTopAlert('提交成功，请耐心等待审核');
			setTimeout(function () {
				window.location.reload()
			}, 2000)
		})
		.catch(function (data) {
			screenTopWarning(data.error);
		})
}


function unSubmitAuth(uid, number) {
	nkcAPI('/u/' + uid + '/auth?number=' + number, 'DELETE', {})
		.then(function () {
			screenTopAlert('撤销成功');
			window.location.reload();
		})
		.catch(function (data) {
			screenTopWarning(data.error);
		})
}

Object.assign(window, {
	initEvent,
	submitAuth,
	unSubmitAuth,
});


// 上传认证3视频
$("#pickVerify3Video").on("click", () => {
	$("#handheldIdCard").one("change", ({
		target
	}) => {
		const file = target.files[0];
		$(".idcard-video > video").attr("src", URL.createObjectURL(file))
		var formData = new FormData();
		formData.append("file", file);
		nkcUploadFile("verify/verify3_upload_video", "POST", formData, function (event, percentage) {
			console.log(percentage);
		});
	});
	$("#handheldIdCard").trigger("click");
});