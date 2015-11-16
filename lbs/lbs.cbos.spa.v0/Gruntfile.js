
'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        nggettext_extract: {
            pot: {
                files: {
                    "po/template.pot": [
                        "cbos.html",
                        "cbos_components/frequent_apps/view.html",
                        "cbos_components/app_settings/view.html"
                    ]
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    "po/cbos.cn.js": ["po/*.po"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-gettext');
    grunt.registerTask('default', ['nggettext_extract', 'nggettext_compile']);
};