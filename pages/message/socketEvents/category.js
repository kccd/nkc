export function removeCategory(data) {
  const {cid} = data;
  this.$refs[this.pageId.PageList].removeCategory(cid);
}

export function updateCategoryList(data) {
  const {categoryList} = data;
  this.$refs[this.pageId.PageList].updateCategoryList(categoryList);
}