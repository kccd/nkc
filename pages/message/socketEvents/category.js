export function removeCategory(data) {
  const {cid} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.removeCategory) {
    PageList.removeCategory(cid);
  }
}

export function updateCategoryList(data) {
  const {categoryList} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.updateCategoryList) {
    PageList.updateCategoryList(categoryList);
  }
}