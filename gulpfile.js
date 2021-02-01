const terser = require('gulp-terser')
const gulp = require('gulp')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const change = require('gulp-change')
const {src, parallel, dest} = require('gulp')

const jsPath = 'js/*.js';


function performChange(content, done){
    let regex = /^<script src="js\/(?:\S|\s(?!<\/body>))+/gims
    newContent = content.replace(regex, '<script src="./all.js" type="text/javascript"></script>')
    done(null, newContent)
}


function copyHtml(){
    return src('socialbakers_api_wdc_dev.html')
        .pipe(change(performChange))
        .pipe(concat('socialbakers_api_wdc.html'))
        .pipe(gulp.dest('.'))
}


function jsTask(){
    return src(jsPath)
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(terser())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('.'))
}


exports.default = parallel(copyHtml, jsTask)
