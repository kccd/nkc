const gulp = require("gulp");
const less = require("gulp-less");
const babel = require("gulp-babel");
require("babelify");
const browserify = require("browserify"),
      stream = require("vinyl-source-stream"),
      buffer = require('vinyl-buffer');
const glob = require('glob');
const watch = require("gulp-watch");

const lessPath = `pages/**/*.less`;
const cssDest = `pages`;
gulp.task("buildCSS", () => {
  return gulp.src(lessPath)
    .pipe(less())
    .pipe(gulp.dest(cssDest));
});

const jsPath = `view/js/**/*.js`;
const jsDest = `public/js`;
gulp.task("buildJS", () => {
  return gulp.src(jsPath)
    .pipe(babel({
      presets: ['@babel/preset-env'],
    }))
    .pipe(gulp.dest(jsDest));
});

const mjsPath = `pages/**/*.mjs`;
// const mjsDest = `dist`;
// gulp.task("buildMJS", () => {
//   return gulp.src(mjsPath)
//     .pipe(babel({
//       presets: ['@babel/preset-env'],
//     })).pipe(rename(function (path) {
//       path.extname = ".js";
//     }))
//     .pipe(gulp.dest(mjsDest));
// });

gulp.task('browserify', function (done) {
  // var tasks = null;
  glob(mjsPath,function (err, files) {
    if (err) return done(err);

    files.map(function (entry) {
      return browserify({
        entries: [entry],
        debug: true
      })
      .transform("babelify", {presets: ['@babel/preset-env']})
      .bundle()
      .on('error', function (error) {
        console.log(error.toString())
      })
      .pipe(stream(entry.replace('.mjs', '.js').replace('pages/', '')))
      .pipe(buffer())
      .pipe(gulp.dest('pages/'));
    })
  });
  // stream.merge(tasks).on('end', done);
});

gulp.task("watch", () => {
  watch(lessPath, gulp.series("buildCSS"));
  watch(jsPath, gulp.series("buildJS"));
  // gulp.watch(mjsPath, gulp.series("buildMJS"));
  watch(mjsPath, gulp.series("browserify"));
});

