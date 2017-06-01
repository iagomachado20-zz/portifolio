//initialize all of our variables
var content, base, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, minifyCSS, del, browserSync, autoprefixer, gulpSequence, sourceMaps, plumber;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

//load all of our dependencies
//add more here if you want to include more libraries
gulp        = require('gulp');
gutil       = require('gulp-util');
concat      = require('gulp-concat');
uglify      = require('gulp-uglify');
sass        = require('gulp-sass');
sourceMaps  = require('gulp-sourcemaps');
imagemin    = require('gulp-imagemin');
minifyCSS   = require('gulp-minify-css');
browserSync = require('browser-sync');
autoprefixer = require('gulp-autoprefixer');
gulpSequence = require('gulp-sequence').use(gulp);
plumber     = require('gulp-plumber');
sassGlob = require('gulp-sass-glob');

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: "content/"
        },
        options: {
            reloadDelay: 250
        },
        notify: true
    });
});


//compressing images & handle SVG files
gulp.task('images', function(tmp) {
    gulp.src(['content/images/*.jpg', 'content/images/*.png'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
        .pipe(gulp.dest('content/images/compressed'));
});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
    gulp.src(['content/images/**/*', '!content/images/README'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('content/images/compressed'));
});

//compiling our Javascripts
gulp.task('scripts', function() {
    //this is where our dev JS scripts are
    return gulp.src(['content/scripts/src/_includes/**/*.js', 'content/scripts/src/**/*.js'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        //this is the filename of the compressed version of our JS
        .pipe(concat('scripts.js'))
        //catch errors
        .on('error', gutil.log)
        //where we will store our finalized, compressed script
        .pipe(gulp.dest('content/scripts'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true}));
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function() {
    //this is where our dev JS scripts are
    return gulp.src(['content/scripts/src/_includes/**/*.js', 'content/scripts/src/**/*.js'])
                //prevent pipe breaking caused by errors from gulp plugins
                .pipe(plumber())
                //this is the filename of the compressed version of our JS
                .pipe(concat('scripts.js'))
                //compress :D
                .pipe(uglify())
});

//compiling our SCSS files
gulp.task('styles', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src('content/styles/scss/init.scss')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber({
          errorHandler: function (err) {
            console.log(err);
            this.emit('end');
          }
        }))
        //get sourceMaps ready
        .pipe(sourceMaps.init())
        //include SCSS and list every "include" folder
        .pipe(sassGlob())
        .pipe(sass({
              errLogToConsole: true,
              config_file: 'config.rb',
              includePaths: [
                  'content/styles/scss/'
              ]
        }))
        .pipe(autoprefixer({
           browsers: autoPrefixBrowserList,
           cascade:  true
        }))
        //catch errors
        .on('error', gutil.log)
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        //get our sources via sourceMaps
        .pipe(sourceMaps.write())
        //where to save our final, compressed css file
        .pipe(gulp.dest('content/styles'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true}));
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src('content/styles/scss/init.scss')
        .pipe(plumber())
        //include SCSS includes folder
        .pipe(sassGlob())
        .pipe(sass({
          includePaths: [
              'content/styles/scss',
          ]
        }))
        .pipe(autoprefixer({
          browsers: autoPrefixBrowserList,
          cascade:  true
        }))
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        .pipe(minifyCSS());
});

//basically just keeping an eye on all HTML files
gulp.task('html', function() {
    //watch any and all HTML files and refresh when something changes
    return gulp.src('content/*.html')
        .pipe(plumber())
        .pipe(browserSync.reload({stream: true}))
        //catch errors
        .on('error', gutil.log);
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function() {
    //grab everything, which should include htaccess, robots, etc
    gulp.src('content/*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber());

    //grab any hidden files too
    gulp.src('content/.*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber());

    gulp.src('content/fonts/**/*')
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts'));

    //grab all of the styles
    gulp.src(['content/styles/*.css', '!content/styles/styles.css'])
        //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/styles'));
});

gulp.task('default', ['browserSync', 'scripts', 'styles'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('content/scripts/src/**', ['scripts']);
    gulp.watch('content/styles/scss/**', ['styles']);
    gulp.watch('content/images/**', ['images']);
    gulp.watch('content/*.html', ['html']);
});

//this is our deployment task, it will set everything for deployment-ready files
gulp.task('deploy', gulpSequence('clean', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
