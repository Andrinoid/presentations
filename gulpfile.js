var gulp = require('gulp');
var less = require('gulp-less');
var watch = require('gulp-watch');
var liveReload = require('gulp-livereload');
var postCss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var webpack = require('webpack-stream');
var named = require('vinyl-named');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task('minify', function () {
    return gulp.src('src/images/tomedia/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('media/images'));
});

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

gulp.task('default', ['clean', 'build', 'watch']);

gulp.task('build', ['less', 'images', 'transpile']);

gulp.task('watch', function () {
    liveReload.listen();
    gulp.watch('src/less/**/*.less', ['build']);
    gulp.watch('src/js/**/*.js', ['transpile']);
    gulp.watch('src/images/*', ['images']);
    gulp.watch('src/images/tomedia/*', ['minify']);
});

gulp.task('transpile', function () {
    return gulp.src([
            'src/js/frontpage/frontpage.js',
            'src/js/editor/editor.js',
            'src/js/header/header.js',
            'src/js/base.js',
        ])
        .pipe(named())
        .pipe(webpack({
            devtool: 'source-map',
            module: {
                loaders: [{
                    loader: 'babel-loader'
                }]
            }
        }))
        .pipe(gulp.dest('static/js'));
});

gulp.task('less', function () {
    return gulp.src(['src/base.less', 'src/less/editorframe.less'])
        .pipe(plumber({errorHandler: onError}))
        .pipe(less())
        .pipe(postCss([autoprefixer({browsers: ['last 2 versions', 'Explorer 9']})]))
        .pipe(gulp.dest('static/css/'))
        .pipe(liveReload());
});

gulp.task('images', function () {
    return gulp.src('src/images/*')
        .pipe(gulp.dest('static/images/generated/'))
});

gulp.task('clean', function () {
    del('static/js/**/*.js');
    del('static/css/**/*.css');

});
