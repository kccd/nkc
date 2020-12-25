const gulp = require("gulp");
const less = require("gulp-less");
require("babelify");
const browserify = require("browserify"),
      stream = require("vinyl-source-stream"),
      buffer = require('vinyl-buffer');
const glob = require('glob');
const watch = require("gulp-watch");
const uglify = require("gulp-uglify");
const cleanCSS = require("gulp-clean-css");

const lessPath = `pages/**/*.less`;
const cssDest = `pages`;
gulp.task("buildCSS", () => {
  return gulp.src(lessPath)
    .pipe(less())
    .pipe(cleanCSS({compatibility: '*'}))
    .pipe(gulp.dest(cssDest));
});

const mjsPath = `pages/**/*.mjs`;

gulp.task('browserify', function (done) {
  return glob(mjsPath,function (err, files) {
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
      .pipe(uglify())
      .pipe(gulp.dest('pages/'));
    })
  });
});

gulp.task("watch", () => {
  watch(lessPath, { interval: 750 }, gulp.series("buildCSS"));
  watch(mjsPath, { interval: 750 }, gulp.series("browserify"));
});

