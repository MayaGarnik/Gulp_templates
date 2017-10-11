/*******************************
    Internal Task Collection
*******************************/

/* These tasks create packaged files from **dist** components
   Not intended to be called directly by a user because
   these do not build fresh from **src**
*/

module.exports = function(gulp) {

  var
    // node dependencies
    fs         = require('fs'),
    chmod      = require('gulp-chmod'),
    concat     = require('gulp-concat'),
    concatCSS  = require('gulp-concat-css'),
    clone      = require('gulp-clone'),
    dedupe     = require('gulp-dedupe'),
    gulpif     = require('gulp-if'),
    header     = require('gulp-header'),
    less       = require('gulp-less'),
    minifyCSS  = require('gulp-clean-css'),
    plumber    = require('gulp-plumber'),
    print      = require('gulp-print'),
    rename     = require('gulp-rename'),
    replace    = require('gulp-replace'),
    uglify     = require('gulp-uglify'),
    clean       = require('gulp-clean'),
     autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    mmq = require('gulp-merge-media-queries'),
    postcss = require('gulp-postcss'),
    csscomb = require('gulp-csscomb'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    runSequence  = require('run-sequence'),
    gutil = require('gulp-util'),
    debounce   = require('gulp-debounce'),
    wait = require('gulp-wait'),
    color = require('gulp-color'),
    pngquant = require('pngquant'),
    pngmin = require('gulp-pngmin'),
    clean = require('gulp-clean'),

    // user config
    config     = require('./../config/user'),
    docsConfig = require('./../config/docs'),

    // install config
    tasks      = require('./../config/tasks'),
    release    = require('./../config/project/release'),

    // shorthand
    globs      = config.globs,
    assets     = config.paths.assets,
    output     = config.paths.output,

    banner     = tasks.banner,
    filenames  = tasks.filenames,
    log        = tasks.log,
    settings   = tasks.settings
  ;

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

  /*--------------
      Packaged
  ---------------*/

  gulp.task('delete dist', function () {
       // remove dist folder
        del(['dist']);
});

  gulp.task('package uncompressed css', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concatCSS(filenames.concatenatedCSS, settings.concatCSS))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(header(banner, settings.header))
        // .pipe(gulp.dest(output.packaged))
        .pipe(gulp.dest('css'))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed css', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concatCSS(filenames.concatenatedMinifiedCSS, settings.concatCSS))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(minifyCSS(settings.concatMinify))
        .pipe(header(banner, settings.header))
        // .pipe(gulp.dest(output.packaged))
        .pipe(gulp.dest('css'))
        .pipe(print(log.created))
        .on('end', function() {
          // remove dist folder task
          gulp.start('delete dist');
        })
    ;
  });

  gulp.task('package uncompressed js', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concat(filenames.concatenatedJS))
        .pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        // .pipe(gulp.dest(output.packaged))
        .pipe(gulp.dest('js'))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed js', function() {
    return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(plumber())
      .pipe(dedupe())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concat(filenames.concatenatedMinifiedJS))
        .pipe(uglify(settings.concatUglify))
        .pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        // .pipe(gulp.dest(output.packaged))
        .pipe(gulp.dest('js'))
        .pipe(print(log.created))
        .on('end', function() {
          // remove dist folder task
          gulp.start('delete dist');
        })
    ;
  });


  gulp.task('markup less', function() {
    return gulp.src('less/*.less')
    .pipe(plumber(function(error) {
      console.log( colorsTheme.error,  colorsTheme.warn );
        gutil.log(color('Error ' + error.message, colorsTheme.error));
        gutil.log(color('Warning ' +error.messageOriginal, colorsTheme.warn));
        this.emit('end');
    }))
    .pipe(debounce({ wait: 1 }))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(less(settings.less))
     .on('error', function (err) {
       console.log(err);
     })
    .pipe(autoprefixer(settings.prefix))
    .pipe(sourcemaps.write('./', {
        includeContent: false,
        sourceRoot: 'less'
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

gulp.task('watch own markup', ['browserSync', 'markup less', 'images', 'pngmin'], function() {
  gulp.watch('less/**/*.less', ['markup less']);
  gulp.watch('sourceimages/**/*', ['images', 'pngmin']);
  gulp.watch('*.html', browserSync.reload); 
  gulp.watch('js/*.js', browserSync.reload); 
});

gulp.task('distLess', ['clean:css'] , function() {
  return gulp.src('less/**/*.less')
    .pipe(less(settings.less))
     .on('error', function (err) {
       console.log(err);
     })
    .pipe(autoprefixer(settings.prefix))
    .pipe(mmq())
    .pipe(csscomb())
    .pipe(gulp.dest('css'));
});

gulp.task('distImages', function() {
  return  gulp.src('sourceimages/**/*.+(jpg|gif|svg)')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('images'));
});

gulp.task('distPngmin', function() {
  return gulp.src('sourceimages/**/*.png')
  .pipe(cache(pngmin({ '0': pngquant, '1': [ 256 ] })))
  .pipe(gulp.dest('images'));
});

gulp.task('dist', ['distLess', 'distImages', 'distPngmin']);


gulp.task('default own markup', function (callback) {
  runSequence(['browserSync', 'markup less', 'images', 'watch own markup'],
    callback
  )
});

  /*--------------
        RTL
  ---------------*/

  if(config.rtl) {

    gulp.task('package uncompressed rtl css', function () {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignoredRTL + '.rtl.css')
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(concatCSS(filenames.concatenatedRTLCSS, settings.concatCSS))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(header(banner, settings.header))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package compressed rtl css', function () {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignoredRTL + '.rtl.css')
        .pipe(dedupe())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(concatCSS(filenames.concatenatedMinifiedRTLCSS, settings.concatCSS))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(minifyCSS(settings.concatMinify))
          .pipe(header(banner, settings.header))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package uncompressed docs css', function() {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
        .pipe(dedupe())
        .pipe(plumber())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(concatCSS(filenames.concatenatedCSS, settings.concatCSS))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

    gulp.task('package compressed docs css', function() {
      return gulp.src(output.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
        .pipe(dedupe())
        .pipe(plumber())
        .pipe(replace(assets.uncompressed, assets.packaged))
        .pipe(concatCSS(filenames.concatenatedMinifiedCSS, settings.concatCSS))
          .pipe(minifyCSS(settings.concatMinify))
          .pipe(header(banner, settings.header))
          .pipe(gulpif(config.hasPermission, chmod(config.permission)))
          .pipe(gulp.dest(output.packaged))
          .pipe(print(log.created))
      ;
    });

  }

  /*--------------
        Docs
  ---------------*/

  var
    docsOutput = docsConfig.paths.output
  ;

  gulp.task('package uncompressed docs css', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(dedupe())
      .pipe(plumber())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concatCSS(filenames.concatenatedCSS, settings.concatCSS))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed docs css', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.css')
      .pipe(dedupe())
      .pipe(plumber())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concatCSS(filenames.concatenatedMinifiedCSS, settings.concatCSS))
        .pipe(minifyCSS(settings.concatMinify))
        .pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package uncompressed docs js', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(dedupe())
      .pipe(plumber())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concat(filenames.concatenatedJS))
        .pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

  gulp.task('package compressed docs js', function() {
    return gulp.src(docsOutput.uncompressed + '/**/' + globs.components + globs.ignored + '.js')
      .pipe(dedupe())
      .pipe(plumber())
      .pipe(replace(assets.uncompressed, assets.packaged))
      .pipe(concat(filenames.concatenatedMinifiedJS))
        .pipe(uglify(settings.concatUglify))
        .pipe(header(banner, settings.header))
        .pipe(gulpif(config.hasPermission, chmod(config.permission)))
        .pipe(gulp.dest(docsOutput.packaged))
        .pipe(print(log.created))
    ;
  });

};
