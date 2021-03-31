module.exports = function (grunt) {
    grunt.initConfig({
        // define source files and their destinations
        uglify: {
            files: {
                src: 'js/*.js',  // source files mask
                dest: './all.min.js',    // destination folder
                flatten: true,   // remove all unnecessary nesting
            }
        },
        watch: {
            js:  { files: 'js/*.js', tasks: [ 'uglify' ] },
        }
    });
    // load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // register at least this one task
    grunt.registerTask('default', [ 'uglify' ]);
    let dev_file = grunt.file.read("./socialbakers_api_wdc.html");
    let regex = /^<script src="js\/(?:\S|\s(?!<\/body>))+/gims;
    let newContent = dev_file.replace(regex, '<script src="./all.min.js" type="text/javascript"></script>');
    grunt.file.write("./socialbakers_api_wdc_need_fix.html", newContent);
};