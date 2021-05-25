const fs = require("fs-extra");
const path = require("path");
const colors = require("colors");
const rimraf = require("rimraf");
const { watch } = require("gulp");
const less = require("less");
const LessPluginAutoPrefix = require("less-plugin-autoprefix");
const glob = require("glob");
const logUpdate = require("log-update");
const mute = require("mute");

const LESS_GLOBS = "pages/**/*.less";
const ASSETS_GLOBS = "pages/**/*.{pug,html}";
const DIST_DIR = process.env.NODE_ENV === "production"? "dist-prod": "dist";
const spin = "-\\|/";
let spin_slice = 0;
const rotateChar = () => spin[spin_slice++ % spin.length];
function noop() {}

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
    log(`${rotateChar()} [${Number(index) + 1}/${filenames.length}] ${filename} ${colors.bold("->")} ${output}`);
  }
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
    log(`${rotateChar()} [${Number(index) + 1}/${filenames.length}] ${filename} ${colors.bold("->")} ${dest}`);
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
  default: (done) => done(),
}

