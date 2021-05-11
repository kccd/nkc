const fs = require("fs-extra");
const path = require("path");
const colors = require("colors");
const rimraf = require("rimraf");
const { watch } = require("gulp");
const less = require("less");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const glob = require("glob");
const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const nodePolyfills = require("rollup-plugin-node-polyfills");
const { terser } = require("rollup-plugin-terser");
const { babel } = require("@rollup/plugin-babel");
const logUpdate = require("log-update");
const mute = require("mute");

const SCRIPTS_GLOBS = "pages/**/*.{js,mjs}";
const LESS_GLOBS = "pages/**/*.{less,css}";
const ASSETS_GLOBS = "pages/**/*.!(less|css|mjs|js)";
const DIST_DIR = "dist";
const spin = "-\\|/";

const autoprefixPlugin = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

// 编译单个css
async function compileCss(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const output = path.join(__dirname, DIST_DIR, filename, "../", basename + ".css");
  const cssContent = (await fs.readFile(filename)).toString();
  console.log(`${colors.cyan.bold("compiling")}: ${filename}`);
  const lessOutput = await less.render(cssContent.toString(), {
    sourceMap: { sourceMapFileInline: true },
    filename,
    plugins: [autoprefixPlugin]
  });
  await fs.outputFile(output, lessOutput.css);
  console.log(`${colors.green.bold("complied")}: ${filename} -> ${path.relative(__dirname, output)}`);
  return path.relative(__dirname, output);
}

// 编译所有css/less文件
async function compileAllCss() {
  let r = 0;
  const log = logUpdate.create(process.stdout);
  const filenames = glob.sync(LESS_GLOBS);
  for(let index in filenames) {
    const filename = filenames[index];
    let output;
    const unmute = mute();
    try {
      output = await compileCss(filename);
    } catch (error) {
      unmute();
      return console.log(error);
    }
    unmute();
    r = ++r % spin.length;
    log(`${spin[r]} [${Number(index) + 1}/${filenames.length}] ${filename} ${colors.bold("->")} ${output}`);
  }
}

// 编译所有js脚本文件
async function compileAllJS() {
  let r = 0;
  const log = logUpdate.create(process.stdout);
  const filenames = glob.sync(SCRIPTS_GLOBS);
  for(let index in filenames) {
    const filename = filenames[index];
    let output;
    const unmute = mute();
    try {
      output = await compileJS(filename);
    } catch (error) {
      unmute();
      return console.log(error);
    }
    unmute();
    r = ++r % spin.length;
    log(`${spin[r]} [${Number(index) + 1}/${filenames.length}] ${filename} ${colors.bold("->")} ${output}`);
  }
}

// 打包编译单个js脚本
async function compileJS(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const output = path.join(__dirname, DIST_DIR, filename, "../", basename + ".js");
  console.log(`${colors.cyan.bold("compiling")}: ${filename}`);
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
    ]
  });
  await bundle.write({
    name: basename,
    file: output,
    format: "umd",
    sourcemap: "inline",
    compact: false
  });
  await bundle.close();
  console.log(`${colors.green.bold("complied")}: ${filename} -> ${path.relative(__dirname, output)}`);
  return output;
}

// 复制单个静态文件文件
async function copyAsset(from, to) {
  await fs.copy(from, to, {
    recursive: true
  });
  console.log(`${colors.green.bold("copied")}: ${from} -> ${path.relative(__dirname, to)}`);
}

// 复制全部静态文件
async function copyAllAssets() {
  let r = 0;
  const log = logUpdate.create(process.stdout);
  const filenames = glob.sync(ASSETS_GLOBS);
  for(let index in filenames) {
    const filename = filenames[index];
    const unmute = mute();
    const dest = path.join(__dirname, DIST_DIR, filename);
    try {
      await copyAsset(filename, dest);
    } catch (error) {
      unmute();
      return console.log(error);
    }
    unmute();
    r = ++r % spin.length;
    log(`${spin[r]} [${Number(index) + 1}/${filenames.length}] ${filename} ${colors.bold("->")} ${dest}`);
  }
}


// 监听编译css/less文件
function watchCompileCss() {
  const onCompile = async filename => {
    try {
      await compileCss(filename)
    } catch (error) {
      console.log(error);
    }
  };
  watch(LESS_GLOBS).on("change", onCompile);
  watch(LESS_GLOBS).on("add", onCompile);
  watch(LESS_GLOBS).on("unlink", filename => {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const dest = path.join(__dirname, DIST_DIR, filename, "../", basename + ".css");
    rimraf(dest, () => console.log(`${colors.green.bold("unlink")}: ${path.relative(__dirname, dest)}`));
  });
  console.log("Watching .less file changes...");
}


// 监听编译js文件
function watchCompileJS() {
  const onCompile = async path => {
    try {
      compileJS(path)
    } catch (error) {
      console.log(error);
    }
  }
  watch(SCRIPTS_GLOBS).on("change", onCompile);
  watch(SCRIPTS_GLOBS).on("add", onCompile);
  watch(SCRIPTS_GLOBS).on("unlink", filename => {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const dest = path.join(__dirname, DIST_DIR, filename, "../", basename + ".js");
    rimraf(dest, () => console.log(`${colors.green.bold("unlink")}: ${path.relative(__dirname, dest)}`));
  });
  console.log("Watching js file changes...");
}


// 监听拷贝静态资源
function watchAssets() {
  const destPath = filename => path.join(__dirname, DIST_DIR, filename);
  const onCopy = async filename => {
    try {
      copyAsset(filename, destPath(filename))
    } catch (error) {
      console.log(error);
    }
  }
  watch(ASSETS_GLOBS).on("change", onCopy);
  watch(ASSETS_GLOBS).on("add", onCopy);
  watch(ASSETS_GLOBS).on("unlink", filename => {
    const dest = path.join(__dirname, DIST_DIR, filename);
    rimraf(dest, () => console.log(`${colors.green.bold("unlink")}: ${path.relative(__dirname, dest)}`));
  });
  console.log("Watching assets changes...");
}

module.exports = {
  "copy:assets":  () => copyAllAssets(),
  "watch:assets": () => watchAssets(),
  "compile:css": () => compileAllCss(),
  "watch:css":   () => watchCompileCss(),
  "compile:js":   () => compileAllJS(),
  "watch:js":     () => watchCompileJS(),
  default: (done) => done()
}

