import Vue from "vue";
import { defineComponent, onMounted } from "@vue/composition-api";
import styled from "vue-styled-components";

const StyledDiv = styled.div`
  padding: 10px;
  background-color: #000000;
  p {
    color: #d8d8d8;
  }
`;

// 1、Vue2组件声明
export const XComponent = Vue.component("x-component", {
  data: () => ({
    message: "Vue2 jsx"
  }),
  render() {
    return (
      <StyledDiv>
        <p>hello {this.message}</p>
      </StyledDiv>
    );
  }
});


// 2、函数式、无状态组件声明
export const FunctionalComponent = ({ props }) => <p>Functional Component</p>


// 2、Vue3组件声明
export const DefineComponent = defineComponent({
  props: {
    msg: {
      type: String,
      required: true
    }
  },
  setup(props) {
    onMounted(() => {
      console.log("mounted!", "props: ", props);
    });
  },
  data() {
    return {
      message: "Define Component"
    }
  },
  render() {
    return <p>vue3 {this.message}</p>
  }
});


// 4、依赖eslint声明组件
// @vue/component
export const ESLintComponent = {
  name: "eslint-component",
  data() {
    return {
      message: "eslint component",
      counter: 0
    }
  },
  methods: {
    sayHello(event) {
      console.log("Hello", event);
      this.counter += 1;
    }
  },
  render() {
    return <p onClick={this.sayHello}>{this.message} counter: {this.counter}</p>
  }
}

// 5、JSX写vue单文件组件，见本目录下xcomponent.vue
