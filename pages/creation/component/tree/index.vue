<template>
  <div class="child_tree" :class="{ disable: data.isMove && !operations }">
    <!--     :class="{ disable: (childrenDisable || childDisable) && !operations }" -->
    <div
      class="child_tree_row col-xs-12.col-md-12"
      :class="{ active: isShowOperation }"
      @mouseenter="operations && mouseEnter()"
      @mouseleave="operations && mouseEnter()"
    >
      <!-- @click="!operations && moveIndication(data)" -->
      <!-- <div> -->
      <span :style="{ width: level * 24 + 'px' }"></span>
      <span
        class="icon seat"
        @click.stop="toggle(childIndex)"
        v-if="data.child && data.child.length > 0"
        :class="{ down: isOpen.status, right: !isOpen.status }"
      >
      </span>
      <span class="seat" v-else></span>
      <span v-if="operations">
        <span class="status" v-if="!data.published">[未发布]</span>
        <span class="status" v-else-if="data.hasBeta">[编辑中]</span>
      </span>
      <span
        v-if="operations"
        class="title"
        @click.stop="
          data.type === 'text' && operations && clickArticleTitle(data)
        "
        >{{ data.value }}</span
      >
      <span
        v-else
        class="fill"
        :class="{
          ellipsis: data.showIndication && !data.isMove,
        }"
        @click.stop="moveIndication(data, childIndex)"
        >{{ data.value }}</span
      >
      <span class="click_block" v-if="operations" @click="toggle()"></span>

      <!-- </div> -->

      <!-- <transition name="fade"> -->
      <div v-if="operations">
        <div class="operations" v-show="isShowOperation">
          <span @click.stop="addGroup(data,childIndex)">新建分组</span>
          <span @click.stop="addDocument(data, childIndex, bid)">新建文档</span>
          <span @click.stop="moveDirectory(data, childIndex, isOpen)"
            >移动</span
          >
          <span @click.stop="deleteDirectory(data, childIndex)">删除</span>
        </div>
        <div class="time" v-show="!isShowOperation">{{ data.time }}</div>
      </div>
      <div
        v-else-if="!operations && data.showIndication && !data.isMove"
        class="move_level col-xs-12.col-md-12"
      >
        <span>移动为</span>
        <label for="" style="margin-left: 5px; margin-bottom: 0">
          <span>
            同级
            <input type="radio" value="sameLevel" v-model="levelSelect" />
          </span>
        </label>
        <label for="" style="margin-left: 5px; margin-bottom: 0">
          <span>
            子级
            <input type="radio" value="childLevel" v-model="levelSelect" />
          </span>
        </label>
        <!-- </div> -->
      </div>
    </div>
    <!-- 可以把这个布局给放到 radio 中  -->
    <div
      v-if="!operations && data.showIndication && !data.isMove"
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
    <!-- <transition-group name="fade" tag='ul'> -->
    <!-- <transition name="fade"> -->
    <template v-for="(child, j) in data.child">
      <Tree
        v-show="isOpen.status"
        :key="j"
        :data="child"
        :level="level + 1"
        :childIndex="childIndex + j.toString()"
        :operations="operations"
        :childrenDisable="childrenDisable"
        :childDisable="child.isMove"
      ></Tree>
    </template>
    <!-- </transition> -->
    <!-- </transition-group> -->
  </div>
</template>
<script>
let globalStatus = {};
let i = 0;
import { EventBus } from "../../eventBus.js";
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
      levelSelect: "childLevel",
      isOpen: { status: false },
      isShowOperation: false,
      isShowAddGroup: false,
      addGroupDefaultName: "新建分组",
      showIndication: { status: false },
    };
  },
  inject: ["datas"],
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
  computed: {
    // newData() {
    //   console.log('this.data',this.data)
    //   return {
    //     ...this.data,
    //     isShowAddGroup: false,
    //     isMove:false
    //   };
    // },
  },
  created() {},
  mounted() {},
  updated() {},
  watch: {
    levelSelect() {
      EventBus.$emit("levelSelect", this.levelSelect);
    },
  },
  methods: {
    moveIndication(data, childIndex) {
      // 如果为禁用状态就不显示指示
      if (this.childDisable || this.childrenDisable) {
        this.isOpen.status = !this.isOpen.status;
        return;
      } else if (this.isOpen.status) {
        if (!this.showIndication.status) {
          // this.showIndication.status = true;
          EventBus.$emit("showIndication", childIndex, this.isOpen.status);
          return;
        } else {
          this.isOpen.status = false;
        }
      }
      this.isOpen.status = !this.isOpen.status;
      // 当打开状态时 应该 应该先关闭其他指示，在当前下面打开指示。
      EventBus.$emit("showIndication", childIndex, this.isOpen.status);
    },
    toggle(instruct) {
      switch (instruct) {
        //  打开新建分组
        case "on":
          this.isOpen.status = true;
          break;
        case "off":
          this.isOpen.status = false;
          break;
        default:
          this.isOpen.status = !this.isOpen.status;
      }
    },
    // 编辑
    clickArticleTitle(data) {
      const { bid } = this;
      const aid = data?._id;
      this.navToPage("articleEditor", { bid, aid });
    },
    mouseEnter() {
      this.isShowOperation = !this.isShowOperation;
    },
    addGroup(data,childIndex) {
      //
      this.isShowAddGroup = !this.isShowAddGroup;
      this.toggle("on");
      this.listener("add-group-input",data,childIndex);
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
      // 拿到 aid 给后端
      EventBus.$emit("addGroup", {
        type:'create',
        aid:data._id,
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
    deleteDirectory(data, childIndex) {
      // 直接把数据后端验证数据是否正确就可以了
      EventBus.$emit("deleteDirectory",data, childIndex);
    },
    moveDirectory(data, childIndex, isOpen) {
      // 拿到 aid 后直接给后端
      EventBus.$emit("moveDirectory", data, childIndex, isOpen);
    },

    // 新建分组使进行监听，如果点击除自己外的元素，就进行添加数据
    listener(element,data) {
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
.disable {
  background-color: rgba(129, 128, 128, 0.226);
  cursor: not-allowed;
}
.child_tree {
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
    color: pink;
    position: absolute;
    top: -22%;
    left: 3%;
  }
  .line {
    display: inline-block;
    border-bottom: 1px solid pink;
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
.child_tree_row {
  padding: 0 5px;
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
    flex: auto;
    max-width: 6rem;
    // max-width: 100px;
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
      padding: 5px 5px;
      cursor: pointer;
      margin-left: 10px;
      color: rgb(5, 5, 5);
      border: 1px solid rgba(129, 128, 128, 0.226);
      border-radius: 4px;
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