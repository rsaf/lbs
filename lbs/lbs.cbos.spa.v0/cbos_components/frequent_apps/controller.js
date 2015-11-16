/**
 * Created by leo on 9/7/15.
 */

define(['cbos'], function(cbos) {
    console.log("frequent apps controller loaded");

    cbos.controllers('tableFrequentAppsController', function ($scope){
        console.log('frequent apps  controller executed ');
        //562f25e96970e66c1e34cb5a
        //5639d9fbac02ca1f505b35b4

        var message = {
            "sqm": {"parent": "563af9119430a2d5541ea436"},
            "op": "ams_read_entities",
            "pl": {
                "rows": {}
            }
        };
        lbs.cbos.message(message).then(function (r) {
            console.log("SPA: read tables row data json ===========> ", r);
            lbs.cbos.user.desktop.appsfreq= r.pl.rows;
            $scope.rows = r.pl.rows;
        });
    });

    cbos.base.appIcons = [
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_hr.png",
            "name": "HR"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_sales.png",
            "name": "Sales"
        },

        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_crm.png",
            "name": "CRM"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_pms.png",
            "name": "PMS"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_scm.png",
            "name": "SCM"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_finance.png",
            "name": "Finance"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_kms.png",
            "name": "KMS"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_ppm.png",
            "name": "PPM"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_relations.png",
            "name": "PPM"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_bpm.png",
            "name": "BPM"
        },
        {
            "url": "cbos_layouts/desktop/theme/images/app_icon_dms.png",
            "name": "DMS"
        }];

    cbos.directives('cbosTableFrequentApps', function() {
        console.log("frequent apps directives  executed ...");
        return {
            restrict:'E',
            scope: {
                onChange: '&'
            },
            controller: 'tableFrequentAppsController',
            templateUrl: 'cbos_components/frequent_apps/view.html'
        }
    });
});
