const data = NKC.methods.getDataById("data");
const app = new Vue({
	el: "#app",
	data: {
		grades: data.grades,
		gradeSettings: data.gradeSettings
	},
	mounted: function() {
		NKC.methods.initSelectColor();
	},
	methods: {
		checkNumber: NKC.methods.checkData.checkNumber,
		checkString: NKC.methods.checkData.checkString,
		save: function() {
			const colors = $("input.color");
			for(let i = 0; i < colors.length; i++) {
				const color = colors.eq(i);
				const index = color.attr("data-index");
				app.grades[index].color = color.val();
			}
			const {grades, gradeSettings} = this;
			nkcAPI("/e/settings/grade", "PUT", {
				grades,
				gradeSettings,
			})
				.then(function() {
					sweetSuccess("保存成功");
				})
				.catch(sweetError)
		},
		removeGrade: function(index) {
			this.grades.splice(index, 1);
		},
		addGrade: function() {
			this.grades.push({
				_id: "",
				displayName: "新建等级",
				score: 0,
				color: "#aaaaaa",
				description: ""
			});
		}
	}
});
