const path = require("path");
const { parentPort, MessagePort, workerData} = require("worker_threads");
const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const nodePolyfills = require("rollup-plugin-node-polyfills");
const { terser } = require("rollup-plugin-terser");
const { babel } = require("@rollup/plugin-babel");
const mute = require("mute");
const {DIST_DIR} = workerData;

const unmute = mute();

parentPort.addListener("message", (data) => {
  if(data.port instanceof MessagePort) {
    inReady(data.port);
  } else {
    process.exit();
  }
});

/**
 * 就绪状态
 * @param {MessagePort} port 消息接口
 */
function inReady(port) {
  port.addListener("message", async data => {
    const { filename, exit } = data;
    if(exit) process.exit();
    let output;
    try {
      output = await compileJS(filename);
    } catch (error) {
      unmute();
      console.log(error);
      return port.postMessage({ error: true });
    }
    port.postMessage({ filename, output });
  })
}

// 打包编译单个js脚本
async function compileJS(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const output = path.join(__dirname, DIST_DIR, filename, "../", basename + ".js");
  const bundle = await rollup.rollup({
    input: filename,
    plugins: [
      nodePolyfills(),
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        presets: [
          ["@babel/preset-env", {
            targets: {
              chrome: "38",
              ie: "11"
            }
          }]
        ],
        plugins: ["@babel/plugin-transform-object-assign"]
      }),
      process.env.NODE_ENV === "production" && terser()
    ],
    cache: true,
  });
  await bundle.write({
    name: basename,
    file: output,
    format: "umd",
    sourcemap: process.env.NODE_ENV === "production" ? false : "inline",
    compact: false
  });
  await bundle.close();
  return output;
}