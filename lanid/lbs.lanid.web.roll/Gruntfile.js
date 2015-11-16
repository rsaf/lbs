//install the cli(as sudo): npm install -g grunt-cli
// install grunt: npm install grunt grunt-angular-templates grunt-contrib-watch --save-dev --verbose
var angularjsToMustache = function angularjsToMustache(module,script,lbs){
  console.log('returning');
  script = script.replace(/\$templateCache\.put\(\'static/igm,lbs+'[\'');
  script = script.replace(/\.html\'\,/igm,'.html\']=');
  script = script.replace(/\n  \)\;/igm,';');
  return script;
};

 module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      smmtemplates: {
        files: ['static/workspace/services/*.html'],
        tasks: ['ngtemplates:smm']
      }
    }
    ,ngtemplates:{
      smm:{
        src:['static/workspace/services/*.html']
        ,dest:'static/workspace/services/template.js'
        ,options:{
          htmlmin:{collapseWhitespace:true}
          ,bootstrap:function(module,script){
            return angularjsToMustache(module,script,'lbs.workspace.smm.cache');
          }
        }
      }
    }
  });
  // Load the plugin that provides the "nodeunit" task.
  grunt.loadNpmTasks('grunt-angular-templates');
  // Load the plugin that provides the "watch" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
  grunt.registerTask('default', ['ngtemplates']);
};