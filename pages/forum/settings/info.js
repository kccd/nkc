const data = NKC.methods.getDataById('data');
const forum = data.forum;
forum._noticeThreadsId = (forum.noticeThreadsId || []).join(", ");
forum._basicThreadsId = (forum.basicThreadsId || []).join(", ");
forum._valuableThreadsId = (forum.valuableThreadsId || []).join(", ");
const selectImage = new NKC.methods.selectImage()
import Editor from '../../lib/vue/Editor'
import {getForumEditorConfigs} from "../../lib/js/editor";
import ImageSelector from "../../lib/vue/ImageSelector";
import {blobToFile, fileToBase64} from "../../lib/js/file";
import { debounce } from "../../lib/js/execution";
import { nkcAPI } from "../../lib/js/netAPI";
const app = new Vue({
	el: '#app',
	data: {
		editorName:{
			professionalDescription: 'professionalDescription',
			latestProfessional: 'latestProfessional'
		},
		professionalDescription: false,
		latestProfessional: false,
		logoData: '',
		logoFile: '',
		bannerData: '',
		bannerFile: '',
		submitting: false,
		forum,
		editorPlugs: {
			resourceSelector: false,
			draftSelector: false,
			stickerSelector: false,
			xsfSelector: false,
			mathJaxSelector: false,
		},
	},
	computed: {
		EditorConfigs() {
			return getForumEditorConfigs();
		},
		professionalDescriptionTitle(){
			const {declare, _declare} = forum
			if(!declare && !_declare){
				return "未填写，点击立即填写"
			}
			else if(!declare && _declare){
				return "未提交，点击继续填写"
			}
		  else if(declare && !_declare){
				return "已提交，点击编辑"
			}
			else{
				return "已提交，点击继续编辑"
			}
		},
		latestProfessionalNoticeTitle(){
			const {latestBlockNotice, _latestBlockNotice} = forum
			if(!latestBlockNotice && !_latestBlockNotice){
				return "未填写，点击立即填写"
			}
			else if(!latestBlockNotice && _latestBlockNotice){
				return "未提交，点击继续填写"
			}
		  else if(latestBlockNotice && !_latestBlockNotice){
				return "已提交，点击编辑"
			}
			else{
				return "已提交，点击继续编辑"
			}
		}
	},
	mounted() {
		const self = this;
		setTimeout(() => {
			NKC.methods.initSelectColor(color => {
				self.forum.color = color;
			});
		}, 100)
	},
	components: {
		'editor': Editor,
		'image-selector': ImageSelector
	},
	methods: {
		
		showEditor(editor){
			this[editor] = true;
		},
		professionalDescriptionContent(){
			const content = this.$refs.forumExplainEditor.getContent();;
			debounce(()=>{
				nkcAPI(`/f/${this.forum.fid}/settings/info/declare`, "PUT", { _declare: content })
				.catch(err=>{
					sweetError(err);
				})
			}, 500)()
		},
		latestProfessionalContent(){
			const content = this.$refs.forumNoticeEditor.getContent();
			debounce(()=>{
				nkcAPI(`/f/${this.forum.fid}/settings/info/latestBlockNotice`, "PUT", { _latestBlockNotice: content })
				.catch((err)=>{
					sweetError(err);
				});
			}, 500)()
		},

		getUrl: NKC.methods.tools.getUrl,
		editorReady(editorName) {
			this.setEditorContent(editorName);
		},
		setEditorContent(editorName) {
			if(editorName === "professionalDescription"){
				this.$refs.forumExplainEditor.setContent(forum._declare || forum.declare);
			}else if(editorName === "latestProfessional"){
				this.$refs.forumNoticeEditor.setContent(forum._latestBlockNotice || forum.latestBlockNotice);
			}
		},
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
			// selectImage.show(d => {
			// 	const file = NKC.methods.blobToFile(d);
			// 	NKC.methods.fileToUrl(file)
			// 		.then(d => {
			// 			self.logoData = d;
			// 			self.logoFile = file;
			// 			selectImage.close();
			// 		})
			// }, {
			// 	aspectRatio: 1
			// });
			self.$refs.imageSelector.open({
					aspectRatio: 1
			})
				.then(res => {
					const file = blobToFile(res);
					fileToBase64(file)
						.then(res => {
							self.logoData = res;
						});
					self.logoFile = res;
					self.$refs.imageSelector.close();
				})
				.catch(err => {
					console.log(err);
					sweetError(err);
				});
		},
		selectBanner() {
			const self = this;
			// selectImage.show(d => {
			// 	const file = NKC.methods.blobToFile(d);
			// 	NKC.methods.fileToUrl(file)
			// 		.then(d => {
			// 			self.bannerData = d;
			// 			self.bannerFile = file;
			// 			debugger
			// 			selectImage.close();
			// 		})
			// }, {
			// 	aspectRatio: 4
			// });
			self.$refs.imageSelector.open({
				aspectRatio: 4
			})
				.then(res => {
					const file = blobToFile(res);
					fileToBase64(file)
						.then(res => {
							self.bannerData = res;
						});
					self.bannerFile = res;
					self.$refs.imageSelector.close();
				})
				.catch(err => {
					console.log(err);
					sweetError(err);
				});
		},
		// toEditor() {
		// 	NKC.methods.visitUrl('/editor?type=forum_declare&id='+this.forum.fid, true);
		// },
		// toLatestNoticeEditor() {
		// 	NKC.methods.visitUrl('/editor?type=forum_latest_notice&id='+this.forum.fid, true);
		// },
		save() {
			const self = this;
			const {forum} = self;
			Promise.resolve()
				.then(() => {
					self.submitting = true;
					forum.noticeThreadsId = self.str2arr(forum._noticeThreadsId);
					forum.basicThreadsId = self.str2arr(forum._basicThreadsId);
					forum.valuableThreadsId = self.str2arr(forum._valuableThreadsId);
					// 如果没有打开编辑器 那么优先提交正在编辑的内容 如果正在编辑的内容不存在才是保存已经发布的内容					
					forum.declare = self.$refs.forumExplainEditor?.getContent() || forum._declare || forum.declare;
					forum.content = self.$refs.forumNoticeEditor?.getContent() || forum._latestBlockNotice || forum.latestBlockNotice;
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
					self.$refs.forumExplainEditor?.removeNoticeEvent();
					self.$refs.forumNoticeEditor?.removeNoticeEvent();
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
