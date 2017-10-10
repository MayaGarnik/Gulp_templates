var gulp = require('gulp'),
	less = require('gulp-less'),
	mmq = require('gulp-merge-media-queries'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	csscomb = require('gulp-csscomb'),
	watch = require('gulp-watch'),
	browserSync = require('browser-sync').create(),
	imagemin = require('gulp-imagemin'),
	pngmin = require('gulp-pngmin'),
	clean = require('gulp-clean'),
	runSequence = require('run-sequence'),
	sourcemaps = require('gulp-sourcemaps'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	debounce   = require('gulp-debounce'),
	wait = require('gulp-wait'),
	color = require('gulp-color'),
	pngquant = require('pngquant');

var processors = [
    autoprefixer({browsers: ['last 4 version']})
];

// set theme 
colorsTheme = {
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'YELLOW',
  debug: 'blue',
  error: 'RED'
};


gulp.task('browserSync', function() {
  browserSync.init({
	bsFiles: {
		src : ['*.html','css/*.css', '*.css']
	},
    server: {
        baseDir: "../",
        index: "index.html",
        directory: true
    },
    watchTask: true
  });
});

gulp.task('less', function() {
    return gulp.src(['less/all.less'])
      .pipe(plumber(function(error) {
          gutil.log(color('Error ' + error.message, colorsTheme.error));
          gutil.log(color('Warning ' +error.messageOriginal, colorsTheme.warn));
          this.emit('end');
      }))
      .pipe(debounce({ wait: 1 }))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(less({
        sourcemap: true
      }).on('error', function(error) {
        this.emit('end');
      }))
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('css'))
      .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('images', function(){
  return  gulp.src('sourceimages/**/*.+(jpg|gif|svg)')
	.pipe(gulp.dest('images'));
});

gulp.task('pngmin', function(){
  return gulp.src('sourceimages/**/*.png')
	.pipe(gulp.dest('images'));
});

gulp.task('clean:css', function() {
  return gulp.src('css')
      .pipe(clean({force: true}));
});

gulp.task('watch', ['browserSync', 'less', 'images', 'pngmin'], function() {
	gulp.watch(['less/**/*.less'], ['less']);
  gulp.watch('sourceimages/**/*', ['images', 'pngmin']);
	gulp.watch('*.html', browserSync.reload); 
	gulp.watch('js/*.js', browserSync.reload); 
});

gulp.task('distLess', ['clean:css'] , function() {
  return gulp.src(['less/all.less'])
    .pipe(less().on('error', function(error) {
        this.emit('end');
    }))
    .pipe(postcss(processors))
    .pipe(mmq())
    .pipe(csscomb())
    .pipe(gulp.dest('css'));
});

gulp.task('distImages', function() {
  return  gulp.src('sourceimages/**/*.+(jpg|gif|svg)')
	.pipe(imagemin())
	.pipe(gulp.dest('images'));
});

gulp.task('distPngmin', function() {
  return gulp.src('sourceimages/**/*.png')
	.pipe(pngmin({ '0': pngquant, '1': [ 256 ] }))
	.pipe(gulp.dest('images'));
});

gulp.task('dist', ['distLess', 'distImages', 'distPngmin']);


gulp.task('default', function (callback) {
  runSequence('clean:css', 
    ['less', 'browserSync', 'watch'],
    callback
  );
});
