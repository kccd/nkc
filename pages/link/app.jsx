import { createApp } from "@vue/composition-api";
import styled, { injectGlobal } from "vue-styled-components";
import data from "./lib/data";
import base64js from "base64-js";
import { nkcAPI } from "../lib/request";

const app = createApp({
  setup() {
    const byteArray = base64js.toByteArray(data.target);
    const url = String.fromCharCode(...byteArray);
    return {
      target: url,
      id: data.id,
      confirm: data.confirm,
      siteName: data.siteName,
      wait: false
    }
  },
  render() {
    return (
      <Wrapper>
        <div class="box">
          <h1>即将离开{this.siteName}</h1>
          <p class="info">{this.confirm}</p>
          <p class="link">{this.target}</p>
        </div>
        <div class="actions">
          <button
            onClick={async () => {
              if(this.wait) return;
              this.wait = true;
              await nkcAPI("./l/report", "POST", {
                accept: true,
                id: this.id
              });
              location.href = this.target;
            }}>
            继续访问
          </button>
        </div>
      </Wrapper>
    );
  }
});

injectGlobal`
  * {
    padding: 0;
    margin: 0;
  }
  body {
    padding: 0 12px;
    padding-top: 100px;
  }
`;
const Wrapper = styled.div`
  max-width: 540px;
  background-color: rgb(253, 253, 253);
  border: 1px solid rgb(202, 202, 202);
  border-radius: 6px;
  margin: 0 auto;
  padding: 25px 30px;
  .box {
    border-bottom: 1px solid rgb(218, 218, 218);
    h1 {
      font-size: 1.1em;
    }
    .info, .link {
      color: black;
      font-size: .9em;
      margin-top: 12px;
    }
    .link {
      cursor: pointer;
      margin-bottom: 12px;
    }
    .info {
      white-space: pre-wrap;
    }
  }
  .actions {
    padding-top: 25px;
    text-align: right;
    button {
      padding: 10px 14px;
      cursor: pointer;
      border: none;
      color: white;
      background-color: rgb(43, 144, 217);
      border-radius: 4px;
    }
  }
`;

app.mount("#app");