const data = NKC.methods.getDataById('data');
const forum = data.forum;
forum._noticeThreadsId = (forum.noticeThreadsId || []).join(", ");
forum._basicThreadsId = (forum.basicThreadsId || []).join(", ");
forum._valuableThreadsId = (forum.valuableThreadsId || []).join(", ");
const selectImage = new NKC.methods.selectImage()
const app = new Vue({
	el: '#app',
	data: {
		logoData: '',
		logoFile: '',
		bannerData: '',
		bannerFile: '',
		submitting: false,
		forum
	},
	mounted() {
		const self = this;
		setTimeout(() => {
			NKC.methods.initSelectColor(color => {
				self.forum.color = color;
			});
		}, 100)

	},
	methods: {
		getUrl: NKC.methods.tools.getUrl,
		str2arr(str) {
			const arr = str.split(',');
			const _arr = [];
			arr.map(a => {
				a = a.trim();
				if(a) _arr.push(a);
			});
			return _arr;
		},
		selectLogo() {
			const self = this;
			selectImage.show(d => {
				const file = NKC.methods.blobToFile(d);
				NKC.methods.fileToUrl(file)
					.then(d => {
						self.logoData = d;
						self.logoFile = file;
						selectImage.close();
					})
			}, {
				aspectRatio: 1
			});
		},
		selectBanner() {
			const self = this;
			selectImage.show(d => {
				const file = NKC.methods.blobToFile(d);
				NKC.methods.fileToUrl(file)
					.then(d => {
						self.bannerData = d;
						self.bannerFile = file;
						selectImage.close();
					})
			}, {
				aspectRatio: 4
			});
		},
		toEditor() {
			NKC.methods.visitUrl('/editor?type=forum_declare&id='+this.forum.fid, true);
		},
		toLatestNoticeEditor() {
			NKC.methods.visitUrl('/editor?type=forum_latest_notice&id='+this.forum.fid, true);
		},
		save() {
			const self = this;
			const {forum} = self;
			Promise.resolve()
				.then(() => {
					self.submitting = true;
					forum.noticeThreadsId = self.str2arr(forum._noticeThreadsId);
					forum.basicThreadsId = self.str2arr(forum._basicThreadsId);
					forum.valuableThreadsId = self.str2arr(forum._valuableThreadsId);
					const formData = new FormData();
					formData.append('forum', JSON.stringify(forum));
					if(self.logoFile) {
						formData.append('logo', self.logoFile);
					}
					if(self.bannerFile) {
						formData.append('banner', self.bannerFile);
					}
					return nkcUploadFile(`/f/${self.forum.fid}/settings/info`, 'PUT', formData);
				})
				.then((data) => {
					if(data.logo) {
						self.logoData = '';
						self.logoFile = '';
						self.forum.logo = data.logo;
					}
					if(data.banner) {
						self.bannerData = '';
						self.bannerFile = '';
						self.forum.banner = data.banner;
					}
					sweetSuccess('保存成功');
					self.submitting = false;
				})
				.catch(err => {
					self.submitting = false;
					sweetError(err);
				});
		}
	}
});

Object.assign(window, {
	forum,
	selectImage,
	app,
})