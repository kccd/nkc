export const util={
  changeChild(self, data, key, value) {
    if (data) {
      data.forEach((item) => {
        self.$set(item, key, value);
        if (item.child) {
          changeChild(item.child, key, value);
        }
      });
    }
  },
  //  把 子级 父级 同级 都 写入 就不用 每次都要循环找不同级别
  seekChild(self,{ data, position, currentIndex, findLocation, type = "self" }) {
    const child = data[position];
    console.log(child, "child");
    if (type === "parent") {
      self.seekResult = child;
      // 点击内层
      if (currentIndex === findLocation.length - 2) {
        self.seekResult = child;
        return;
      }
      if (child) {
        if (child.child) {
          self.seekResult = child.child;
        } else {
          self.seekResult = child;
        }
      }
      // 点击最外层
      if (findLocation.length == 1) {
        self.seekResult = data
      }
    } else if (type === "childe") {
    } else {
      if (child) {
        if (currentIndex === findLocation.length - 1) {
          // console.log("数据查找结果为", self.seekResult=child);
          self.seekResult = child;
          return;
        }
        if (child.child) {
          self.seekResult = child.child;
        } else {
          self.seekResult = child;
        }
      } else {
        console.warn("此位置没有数据");
      }
    }
  },
}