// --------------------------------------------------------------------
// Plugins
// --------------------------------------------------------------------

var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    sourcemaps     = require('gulp-sourcemaps'),
    uncss          = require('gulp-uncss'),
    nano           = require('gulp-cssnano'),
    rename         = require('gulp-rename'),
    nunjucksRender = require('gulp-nunjucks-render'),
    data           = require('gulp-data'),
    notify         = require('gulp-notify'),
    uglify         = require('gulp-uglify'),
    plumber        = require('gulp-plumber'),
    browserSync    = require('browser-sync'),
    cache          = require('gulp-cache'),
    imagemin       = require('gulp-imagemin'),
    fs             = require('fs'),
    cssnano        = require('gulp-cssnano'),
    gutil          = require('gulp-util'),
    critical       = require('critical').stream;

// --------------------------------------------------------------------
// Carpetas fuente y destino - Modificar las rutas según se requiera
// --------------------------------------------------------------------

/*
Ir guardando el histórico de los .json
que vayamos usando para poder switchear fácilmente si
necesitamos hacer cambios sobre alguna promoción que este vigente
y no sea en la que estemos trabajando
*/

var build = {
    sass: "build/sass/*.scss",
    js: "build/js/main.js",
    img: "build/img/**/*",
    html: "build/index.html",
    // json: "build/17_01_20_home_deco.json",
    // json: "build/17_01_23_exclusiva_grisino.json",
    // json: "build/17_01_24_compartida_hotday_mshops.json",
    json: "build/test.json"
};

var dist = {
    css: "dist/css",
    js: "dist/js",
    img: "dist/img",
    html: "dist/index.html"
};


// --------------------------------------------------------------------
// Plumber Error Handler
// --------------------------------------------------------------------

function customPlumber(errTitle) {
  return plumber({
      errorHandler: notify.onError({
        title: errTitle || "Error running Gulp",
        message: "Error: <%= error.message %>",
      })
  });
}


// --------------------------------------------------------------------
// Task: Compilar SASS
// --------------------------------------------------------------------

gulp.task('sass', function(){
  return gulp.src(build.sass)
  .pipe(sourcemaps.init())
  .pipe(customPlumber('Error al compilar SASS'))
  .pipe(sass({outputStyle: 'compressed'}))
  .pipe(rename({
    basename: "main",
    suffix: "-min",
    extname: ".css"
  }))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest(dist.css))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify({ message: 'SASS Compilado' }));
});


// --------------------------------------------------------------------
// Task: Compilar HTML
// --------------------------------------------------------------------

gulp.task('html', function() {
  return gulp.src('build/pages/*.+(html|nunjucks)')
  .pipe(customPlumber('Error al compilar HTML'))
  // .pipe(data(function() {
  //   return require('./build/data.json')
  // }))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json));
  }))
  .pipe(nunjucksRender({
    path: ['build/pages/', 'build/templates/']
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify({ message: 'HTML Compilado' }));
});


// --------------------------------------------------------------------
// Task: Minificar Imgs
// --------------------------------------------------------------------

gulp.task('img', function() {
  return gulp.src(build.img)
  .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
  .pipe(gulp.dest(dist.img));
});


// --------------------------------------------------------------------
// Task: Minificar JS
// --------------------------------------------------------------------

gulp.task('js', function() {
    gulp.src(build.js)
    .pipe(customPlumber('Error al compilar JS'))
    .pipe(uglify({mangle:false}))
    .pipe(rename(function (path) {
		  path.basename += "-min";
		  path.extname = ".js";
		  return path;
    }))
    .pipe(gulp.dest(dist.js))
    .pipe(browserSync.reload({stream: true}))
    .pipe(notify({ message: 'JS Compilado' }));
});


// --------------------------------------------------------------------
// Task: JSON
// --------------------------------------------------------------------

gulp.task('json', ['html'],function(){
  return gulp.src('build/pages/*.+(html|nunjucks)')
  .pipe(customPlumber('Error JSON'))
  .pipe(data(function(){
      return JSON.parse(fs.readFileSync(build.json));
  }))
  .pipe(nunjucksRender({
    path: ['build/pages/', 'build/templates/']
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.reload({stream: true}))
  .pipe(notify({ message: 'JSON Inyectado' }));
});


// --------------------------------------------------------------------
// Task: Watch
// --------------------------------------------------------------------

gulp.task('sass-watch', ['sass'], browserSync.reload);
gulp.task('html-watch', ['html'], browserSync.reload);
gulp.task('js-watch', ['js'], browserSync.reload);
gulp.task('json-watch', ['json'], browserSync.reload);


// --------------------------------------------------------------------
// Task: Default
// --------------------------------------------------------------------

gulp.task('default', ['sass', 'js', 'html'], function () {
    browserSync.init({server: 'dist'});

    gulp.watch(build.sass, ['sass-watch']);
    gulp.watch(build.html, ['html-watch']);
    gulp.watch(build.js, ['js-watch']);
    gulp.watch(build.json, ['json-watch']);
    gulp.watch(["build/templates/layout.nunjucks", "build/templates/partials/*.html"], ['html-watch']);
});


// --------------------------------------------------------------------
// Task: Critical - Above the fold
// --------------------------------------------------------------------

gulp.task('criticalmente', function () {
  return gulp.src('dist/*.html')
    .pipe(critical({
      base: 'dist/',
      inline: true,
      extract: true,
      minify: true,
      width: 1920,
      height: 420,
      ignore: ['@font-face',/url\(/],
      css: 'dist/css/main-min.css'
    }))
    .pipe(gulp.dest('dist/inline'))
    .pipe(notify({ message: 'Above the fold terminado' }));
});


// --------------------------------------------------------------------
// Task: CSSS Nano
// --------------------------------------------------------------------

gulp.task('nano', ['sass'], function() {
  return gulp.src('dist/css/*.css')
    .pipe(cssnano())
    .pipe(rename(function (path) {
      path.basename += "-min";
      path.extname = ".css";
      return path;
    }))
    .pipe(gulp.dest('dist/inline/css'))
    .pipe(notify({ message: 'CSS Minificado' }));
});