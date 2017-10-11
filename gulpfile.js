var gulp = require('gulp'),
	sass = require('gulp-sass'),
	mmq = require('gulp-merge-media-queries'),
	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	csscomb = require('gulp-csscomb'),
	watch = require('gulp-watch'),
	browserSync = require('browser-sync').create(),
	imagemin = require('gulp-imagemin'),
	clean = require('gulp-clean'),
	runSequence = require('run-sequence'),
	sourcemaps = require('gulp-sourcemaps'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	debounce   = require('gulp-debounce'),
	wait = require('gulp-wait'),
	color = require('gulp-color'),
  smushit = require('gulp-smushit');

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

gulp.task('sass', function() {
    return gulp.src('scss/**/*.scss')
      .pipe(plumber(function(error) {
          gutil.log(color('Error ' + error.message, colorsTheme.error));
          gutil.log(color('Warning ' +error.messageOriginal, colorsTheme.warn));
          this.emit('end');
      }))
      .pipe(debounce({ wait: 1 }))
     	.pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass({
      	style: 'expanded',
      	includePaths : ['scss/**/'] , 
      	errLogToConsole: true,
      	sourcemap: true
      }).on('error', sass.logError))
  		.pipe(postcss(processors))
      .pipe(sourcemaps.write('./', {
          includeContent: false,
          sourceRoot: 'scss'
      }))
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

gulp.task('watch', ['browserSync', 'sass', 'images', 'pngmin'], function() {
	gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('sourceimages/**/*', ['images', 'pngmin']);
	gulp.watch('*.html', browserSync.reload); 
	gulp.watch('js/*.js', browserSync.reload); 
});

gulp.task('distSass', ['clean:css'] , function() {
  return gulp.src('scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
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
  .pipe(smushit())
  .pipe(gulp.dest('images'));
});

gulp.task('dist', ['distSass', 'distImages', 'distPngmin']);


gulp.task('default', function (callback) {
  runSequence('clean:css', 
    ['sass', 'browserSync', 'watch'],
    callback
  );
});
