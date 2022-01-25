<template>
  <div class="child_tree" :class="{ disable: data.isMove && !operations }">
    <div
      class="child_tree_row col-xs-12.col-md-12"
      :class="{ active: isShowOperation }"
      @mouseenter="operations && mouseEnter()"
      @mouseleave="operations && mouseEnter()"
    >
      <span :style="{ width: level * 24 + 'px' }"></span>
      <span
        class="icon seat"
        @click.stop="toggle('', childIndex)"
        v-if="data.child && data.child.length > 0"
        :class="{ down: data.isOpen, right: !data.isOpen }"
      >
      </span>
      <span class="seat" v-else></span>
      <span v-if="operations && jurisdiction !== 'tourist'" class="status">
        <span v-if="!data.published && data.type === 'article'">[未发布]</span>
        <span v-else-if="data.hasBeta && data.type === 'article'"
          >[编辑中]</span
        >
      </span>

      <span
        v-if="operations"
        class="title"
        @click.stop="operations && jurisdiction === 'admin' && clickArticleTitle(data, childIndex)"
        >{{ data.title }}</span
      >
      <span
        v-else
        class="fill openArea"
        :class="{
          ellipsis: data.showIndication && !data.isMove,
        }"
        @click.stop="moveIndication(data, childIndex)"
        >{{ data.title }}</span
      >
      <span
        class="click_block openArea"
        v-if="operations && jurisdiction !== 'tourist'"
        @click="toggle('', childIndex)"
      ></span>
      <div v-if="operations && jurisdiction !== 'tourist'">
        <div class="operations" v-show="isShowOperation">
          <span v-if="jurisdiction === 'admin'" @click.stop="add(data, childIndex)">新建子级</span>
          <span v-if="jurisdiction === 'admin'" @click.stop="editor(data, childIndex)">修改</span>
          <span @click.stop="moveDirectory(data, childIndex, data.isOpen, bid)"
            >移动</span
          >
          <span v-if="jurisdiction === 'admin'" @click.stop="deleteDirectory(data, childIndex)">删除</span>
        </div>
        <div class="time" v-show="!isShowOperation">{{ data.time }}</div>
      </div>
      <div
        v-else-if="!operations && data.showIndication && !data.isMove && jurisdiction !== 'tourist'"
        class="move_level col-xs-12.col-md-12"
      >
        <span>移动为</span>
        <label for="" style="margin-left: 5px; margin-bottom: 0">
          <span>
            同级
            <input type="radio" value="sameLevel" v-model="levelSelect" />
          </span>
        </label>
        <label
          v-if="data.describe !== 'seat'"
          for=""
          style="margin-left: 5px; margin-bottom: 0"
        >
          <span>
            子级
            <input type="radio" value="childLevel" v-model="levelSelect" />
          </span>
        </label>
      </div>
    </div>
    <div
      v-if="!operations && data.showIndication && !data.isMove && jurisdiction !== 'tourist'"
      class="level-indication"
      :style="{
        marginLeft:
          (level + (levelSelect === 'childLevel' ? 1 : -0.125)) * 24 + 'px',
      }"
    >
      <span class="glyphicon glyphicon-tag change_glyphicon"></span>
      <span class="line"></span>
    </div>
    <div
      class="add_group"
      v-if="isShowAddGroup"
      :style="{ marginLeft: (level + 1) * 24 + 'px' }"
    >
      <p id="content_wrap">
        <span class="seat"></span>
        <input
          class="add-group-input"
          id="add-group-input"
          type="text"
          v-model="addGroupDefaultName"
          v-focus
        />
      </p>
    </div>
    <template v-for="(child, j) in data.child">
      <Tree
        v-show="data.isOpen"
        :bid="bid"
        :key="j"
        :data="child"
        :level="level + 1"
        :childIndex="childIndex + ',' + j.toString()"
        :operations="operations"
      ></Tree>
    </template>
  </div>
</template>
<script>
import { EventBus } from "../../eventBus.js";
import { sweetQuestion } from "../../../lib/js/sweetAlert";
export default {
  name: "Tree",
  props: {
    data: Object,
    level: Number,
    operations: {
      type: Boolean,
      default: true,
    },
    funcs: Object,
    isMove: Boolean,
    // disable: {
    //   type: Object,
    //   default: () => ({}),
    // },
    childIndex: String,
    childrenDisable: {
      type: Boolean,
      default: false,
    },
    childDisable: {
      type: Boolean,
      default: false,
    },
    bid: String,
  },
  data() {
    return {
      // jurisdiction: "tourist",
      // jurisdiction: "author",
      jurisdiction: "admin",
      levelSelect: "childLevel",
      isShowOperation: false,
      isShowAddGroup: false,
      addGroupDefaultName: "新建分组",
      showIndication: false,
      prevParennNode: "",
    };
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
  computed: {},
  created() {},
  mounted() {},
  updated() {},
  watch: {
    levelSelect() {
      EventBus.$emit("levelSelect", this.levelSelect);
    },
  },
  methods: {
    editor(data, childIndex) {
      if (data.type !== "article") {
        // 传入 bid 修改的数据 修改数据的坐标 对话框标题 对话框类型
        EventBus.$emit("addDialog", {
          bid: this.bid,
          data,
          childIndex,
          title: "修改",
          type: "editor",
        });
      } else {
        this.navToPage("articleEditor", { bid: this.bid, aid: data._id });
      }
    },
    moveIndication(data, childIndex) {
      if (childIndex === "0") {
        this.levelSelect = "sameLevel";
      }
      const { isOpen, showIndication, isMove, parentNode, childrenDisable } =
        this.$props.data;
      childIndex = childIndex.split(",");
      // 如果为禁用状态就不显示指示 禁用状态是可以打开关闭的列表
      if (isMove && !this.$props.operations && childrenDisable) {
        // console.log(1)
        EventBus.$emit("moveDialogOpenMenu", data, childIndex, !isOpen);
        return;
      }
      // 不属于禁用状态的显示线 会走这个
      if (!this.$props.operations && !childrenDisable) {
        // console.log(6)
        EventBus.$emit(
          "moveDialogOpenMenu",
          data,
          childIndex,
          !this.$props.data.isOpen
        );
        EventBus.$emit("showIndication", childIndex, true, data);

        // 禁用状态子级走 这    showIndication 是 bug源
      } else {
        EventBus.$emit(
          "moveDialogOpenMenu",
          data,
          childIndex,
          !this.$props.data.isOpen
        );
      }
    },
    toggle(instruct, childIndex) {
      childIndex = childIndex.split(",");
      const { operations, data } = this.$props;
      switch (instruct) {
        //  打开新建分组
        case "on":
          if (!operations) {
            EventBus.$emit("moveDialogOpenMenu", data, childIndex, true);
          } else {
            EventBus.$emit("openMenu", childIndex, true);
          }
          break;
        case "off":
          if (!operations) {
            EventBus.$emit("moveDialogOpenMenu", data, childIndex, false);
          } else {
            EventBus.$emit("openMenu", childIndex, false);
          }
          break;
        default:
          if (!operations) {
            console.log("toggle");
            EventBus.$emit(
              "moveDialogOpenMenu",
              data,
              childIndex,
              !data.isOpen
            );
          } else {
            EventBus.$emit("openMenu", childIndex, !data.isOpen);
          }
      }
    },
    // 编辑
    clickArticleTitle(data, childIndex) {
      const { bid } = this;
      const aid = data._id;
      // 修改分组名称吗
      console.log(data);
      if (data.type === "text") {
        // 修改url 还是跳转url
      } else if (data.type === "url") {
        window.open(data.url);
        // 修改post 还是跳转
      } else if (data.type === "post") {
        window.open(data.url);
      } else {
        this.navToPage("articleEditor", { bid, aid, data, childIndex });
      }
    },
    mouseEnter() {
      this.isShowOperation = !this.isShowOperation;
    },
    add(data, childIndex) {
      childIndex = childIndex.split(",");
      EventBus.$emit("addDialog", {
        bid: this.bid,
        data,
        childIndex,
        title: "新建子项",
      });
    },
    // 新建分组后添加数据
    addGroupDatas(data) {
      this.isShowAddGroup = false;
      // 违背了单选数据流，还没想到更好的方法先这样
      !this.$props?.data?.child && (this.$props.data.child = []);
      this.$props?.data?.child?.unshift({
        type: "text",
        value: this.addGroupDefaultName,
        published: false,
      });
      EventBus.$emit("addGroup", {
        type: "create",
        aid: data._id,
        articleType: "text",
        value: this.addGroupDefaultName,
      });
      this.addGroupDefaultName = "新建分组";
    },
    // 和
    addDocument(data, i, bid) {
      // data.push({
      //   type: "article",
      //   value: "新建文章",
      //   published: false,
      // });
      // 拿到aid 过后 传入给新增页面，新增页面再拿着aid 去找后端向 aid 里面添加数据
      const aid = data?._id;
      this.navToPage("articleEditor", { bid, aid, type: "article" });
    },
    //删除
    deleteDirectory(data, childIndex) {
      // 直接把数据后端验证数据是否正确就可以了
      sweetQuestion("确认要删除吗？").then((data) => {
        childIndex = childIndex.split(",");
        EventBus.$emit("deleteDirectory", data, childIndex);
      });
    },
    moveDirectory(data, childIndex, isOpen, bid) {
      childIndex = childIndex.split(",");
      EventBus.$emit("moveDirectory", data, childIndex, isOpen, bid);
    },

    // 新建分组使进行监听，如果点击除自己外的元素，就进行添加数据
    listener(element, data) {
      const handler = (e) => {
        // 采用了 v-if 来显示 新增分组元素 ，原因是 如果 v-show ,页面将有多个元素有相同 ID
        const contentWrap = document.getElementById(element);
        if (contentWrap) {
          if (!contentWrap.contains(e.target)) {
            document.removeEventListener("click", handler);
            this.addGroupDatas(data);
          }
        }
      };
      document.addEventListener("click", handler);
    },
    navToPage(name, query = {}, params = {}) {
      this.$router.push({
        name,
        query,
        params,
      });
    },
  },
};
</script>
<style scoped lang='less'>
.openArea {
  // background: rgb(51, 80, 247);
}
.disable {
  background-color: rgba(129, 128, 128, 0.226);
  cursor: not-allowed;
}
.child_tree {
  background: #8db1af;
  margin-bottom: 5px;
}
.move_level {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  .same_level {
    margin-left: 5px;
  }
  .label {
    margin-bottom: 0;
  }
}
.level-indication {
  transition: all 0.3s;
  position: relative;
  height: 10px;
  .change_glyphicon {
    transform: rotate(135deg);
    color: rgb(122, 166, 247);
    position: absolute;
    top: -22%;
    left: 3%;
  }
  .line {
    display: inline-block;
    border-bottom: 1px solid rgb(116, 170, 231);
    height: 1px;
    width: 92%;
    position: absolute;
    top: 41%;
    left: 5%;
  }
}

.change-input-group-addon {
  background: none !important;
  border: none;
  display: inline-block;
}
#content_wrap {
  .add-group-input {
    width: 60%;
  }
}
.icon {
  text-align: right;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-left: 10px solid rgb(97, 96, 96);
  border-bottom: 5px solid transparent;
  transition: all 0.3s;
}
.seat {
  display: inline-block;
  width: 10px;
  height: 10px;
}
.down {
  transform: rotate(90deg);
}
.right {
  transform: rotate(0deg);
}
.active {
  background: rgba(243, 228, 200, 0.322);
}
.status {
  width: 4.2rem;
  display: inline-block;
}
.child_tree_row {
  padding: 2px 5px;
  width: 100%;
  transition: all 0.3s;
  display: flex;
  align-items: baseline;
  // justify-content: space-between;
  .click_block {
    flex: auto;
    opacity: 0;
    height: 15px;
  }
  .title {
    background: #f6f6f6;
    border-radius: 3px;
    text-align: center;
    color: rgb(69, 69, 250);
    flex: auto;
    max-width: 6rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
    margin-left: 5px;
  }
  .fill {
    width: 100%;
    position: relative;
    right: -5px;
  }
  .ellipsis {
    max-width: 6rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .operations {
    text-align: right;
    span {
      padding: 2px 0;
      cursor: pointer;
      margin-left: 5px;
      color: rgb(5, 5, 5);
    }
  }
}
.click_block1 {
  cursor: pointer;
  padding: 10px 0;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.103);
  display: flex;
  justify-content: center;
}
</style>