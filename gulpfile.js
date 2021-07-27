// пакеты из npm
const gulp = require('gulp');
const plumber = require('gulp-plumber');

const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
// todo const minmax = require('postcss-media-minmax');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');

const uglify = require('gulp-uglify-es').default;

const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const newer = require('gulp-newer');

const del = require('del');
const fileinclude = require('gulp-file-include');

const sync = require('browser-sync').create();

// experiment
const typograf = require('gulp-typograf');

// functions
const scripts = () => gulp.src('_src/js/**/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('museum/js'))
  .pipe(sync.stream());
// добавить переименование минифицированных файлов

const styles = () => gulp.src('_src/scss/style.scss')
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(postcss([
    autoprefixer(),
  ]))
  .pipe(sass())
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('museum/css'))
  .pipe(sync.stream());

const html = () => gulp.src(['_src/*.html', '!' + '_src' + '/_*.html'])
  .pipe(fileinclude())
  .pipe(typograf({ locale: ['en-US'] }))
  .pipe(htmlmin({
    removeComments: true,
    collapseWhitespace: true,
  }))
  .pipe(gulp.dest('museum'));

const images = () => gulp.src('_src/img/**/*.{jpg,png,svg}')
  .pipe(newer('museum/img')) // что бы не отпимизировать заново. Но есть ли смысл, если мы вычищаем билд? Проверить.
// Вадим Макеев вообше не сжимает картинки при сборке
  .pipe(imagemin([
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.mozjpeg({ quality: 75, progressive: true }),
    imagemin.svgo({
      plugins: [
        { cleanupIDs: false },
      ],
    }),
  ]))
  .pipe(gulp.dest('museum/img'));

const cleanimg = () => del('museum/img/**/*');

const createWebp = () => gulp.src('_src/img/**/*.{png,jpg}')
  .pipe(webp({ quality: 90 }))
  .pipe(gulp.dest('museum/img'));

const sprite = () => gulp.src('_src/img/**/icon-*.svg')
  .pipe(svgstore())
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('_src/img'));

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: 'museum',
    },
    cors: true,
    notify: false,
    ui: false,
    browser: 'chrome',
    online: true, // если нужно работать оффлайн, можно будет отключить
  });
  done();
};

// Watcher
const watcher = () => {
  gulp.watch(['_src/js/**/*.js', '!_src/js/**/*.min.js'], scripts);
  gulp.watch('_src/scss/**/*.scss', gulp.series('styles'));
  gulp.watch('_src/*.html', gulp.series('html')).on('change', sync.reload);
  gulp.watch('_src/img/**/*.{jpg,png,svg}', images);
};

// копируем файлы в папку museum
const copy = () => gulp.src([
  '_src/fonts/**/*.{woff,woff2}',
  '_src/img/**',
  '_src/js/**',
  '_src/*.ico',
], {
  base: '_src',
})
  .pipe(gulp.dest('museum'));

const clean = () => del('museum');

const build = gulp.series(
  clean,
  copy,
  styles,
  images,
  createWebp,
  sprite,
  html,
  scripts,
);

// чтобы gulp узнал, что есть такие задачи
exports.images = images;
exports.webp = createWebp;
exports.cleanimg = cleanimg;

exports.sprite = sprite;
exports.copy = copy;
exports.clean = clean;

exports.styles = styles;
exports.html = html;
exports.scripts = scripts;

// добавить задачу html
exports.build = gulp.series(clean, copy, styles, images, createWebp, sprite, html, scripts);
exports.default = gulp.series(build, server, watcher);
