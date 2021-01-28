const gulp = require('gulp')
const imagemin = require('gulp-imagemin')
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')
const change = require('gulp-change')
const {src, parallel, dest} = require('gulp')

const jsPath = '*.js';

function performChange(content, done){
    let regex = /^<script src="js\/(?:\S|\s(?!<\/body>))+/gims
    newContent = content.replace(regex, '<script src="js/all.js" type="text/javascript"></script>')
    done(null, newContent)
}

function copyHtml(){
    return src('*.html')
        .pipe(change(performChange))
        .pipe(gulp.dest('dist'))
}

function imgTask(){
    return src('images/*').pipe(imagemin()).pipe(gulp.dest('dist/images'))
}

function jsTask(){
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist/js'))
}


exports.default = parallel(copyHtml, imgTask, jsTask)
