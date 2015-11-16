/**
 * Created by lbs005 on 11/2/15.
 */


function desktop_submitAppCreation ($rootScope,$scope,$state,createApppModalRef){
    var appTitle = $scope.newApp.appTitle.toLowerCase();
    var layout_type =  lbs.cbos.design_layouts_by_code[$state.params.gridId].type;
    $scope.newApp.appAddess = 'https://mycompany.saascbos.com/' + appTitle;

    //"parent": lbs.cbos.user.desktop.appsfreq[0].parent, all frequently use apps have the same parent. set at freq_apps controller
    var newApp = {
        "wf": {
            "wid": "",
            "wtk": "CBWD102",
            "ev": "begin"
        },
        "pl": {
            "app": {
                "parent":lbs.cbos.user.desktop.eid,
                "name": $scope.newApp.appTitle.toLowerCase(),
                "linkTo": "desktop.app({appName:'" + appTitle +"'})",
                "icons": {
                    "idefault": "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg",
                    "iselected": "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg"
                }
            },
            "row": {
                "parent": lbs.cbos.user.desktop.appsfreq[0].parent,
                "rtt": $scope.newApp.appTitle.toLowerCase(),
                "rdt": {
                    "parent":lbs.cbos.user.desktop.eid,
                    "name": $scope.newApp.appTitle.toUpperCase(),
                    "linkTo":"desktop.app({appName:'" + appTitle +"'})" ,
                    "icons": {
                        "idefault": "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg",
                        "iselected": "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg"
                    }
                }
            },
            "layout": {
                "name": "HOME",
                "type": layout_type
            },
            "navigationleft":{
                "name": "Navigation Left",
                "dlb": "HOME",
                "dln": "HOME",
                layouts: {
                    "ln": "HOME",
                    "lb": "HOME",
                    linkTo:"desktop.app.layout({appName:'" + appTitle +"',layoutName:'home'})",
                    icons: {
                        idefault: "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg",
                        iselected: "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg"
                    }
                }
            },
            "navigationtop": {
                "eid": lbs.cbos.user.desktop.topnav.eid,
                "apps": {
                    "name": $scope.newApp.appTitle.toUpperCase(),
                    "linkTo": "desktop.app({appName:'" + appTitle +"'})",
                    "icons": {
                        "idefault": "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg",
                        "iselected": "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg"
                    }
                }
            }
        }
    };

    console.log('SUBMITING APPLICATION INFO',newApp);

    lbs.cbos.message(newApp).then(function(response){
        if(createApppModalRef){createApppModalRef.hide();}
        console.log(' APPLICATION INFO SAVED-----',response);
        var appName = response[0].app.name.toLowerCase();
        lbs.cbos.user.desktop.topnav = response[0].navigationtop;
        lbs.cbos.user.desktop.topnav["appsnav"]= _.indexBy(lbs.cbos.user.desktop.topnav.apps,'name');
        //console.log("lbs.cbos.apps =============>", cbos.apps);
        lbs.cbos.user.desktop.apps[appName]= response[0].app;
        lbs.cbos.user.desktop.apps[appName]["leftnav"] = response[0].navigationleft;
        $rootScope.$broadcast('newAppCreated',{name:appName});
        $state.go("desktop.app",{appName: appName});
    });
};
function app_submitLayoutCreation($rootScope,$scope,$state,createLayoutModalRef){
    console.log('$state-----',$state);
    var layoutName = $scope.newLayout.name;
    var appName = $state.params.appName;
    var layout_type =  lbs.cbos.design_layouts_by_code[$state.params.gridId].type;
    $scope.newLayout.layoutAddess = 'https://mycompany.saascbos.com/' + layoutName;
    // var ltu = "" || "cbos_layouts/templates/createApps/leftnav-2y.html";
    var newLayout_message = {
        "wf": {
            "wid": "",
            "wtk": "CBWD103",
            "ev": "begin"
        },
        "pl": {
            "layout": {
                "name": $scope.newLayout.name.toUpperCase(),
                "type": layout_type
            },
            "navigationleft":{
                "eid":  lbs.cbos.user.desktop.apps[appName]["leftnav"].eid,
                layouts: {
                    "ln": $scope.newLayout.name.toUpperCase(),
                    "lb": $scope.newLayout.name.toUpperCase(),
                    linkTo:"desktop.app.layout({appName:'" + appName + "',layoutName:'" + layoutName.toLowerCase() +"'})",
                    icons: {
                        idefault: "cbos_layouts/desktop/theme/images/newapp_menu_gray.jpg",
                        iselected: "cbos_layouts/desktop/theme/images/newapp_menu_blue.jpg"
                    }
                }
            }
        }
    };
    console.log('SUBMITING LAYOUT CREATION INFO',newLayout_message);
    lbs.cbos.message(newLayout_message).then(function(response){

        if(createLayoutModalRef){createLayoutModalRef.hide();} //hide modal after submitting form
        console.log(' LAYOUT INFO SAVED-----',response);
        $rootScope.$broadcast('newLayoutCreated',{appName:appName.toLowerCase(),leftNav:response[0].navigationleft.layouts});

        lbs.cbos.user.desktop.apps[appName]["leftnav"] = response[0].navigationleft;
        lbs.cbos.user.desktop.apps[appName].leftnav["layoutsnav"] = _.indexBy(response[0].navigationleft.layouts, 'ln');
        $state.go("desktop.app.layout",{appName:appName.toLowerCase(), layoutName:layoutName.toLowerCase()});



    });
};
function canvas_createTable($state,$scope,$rootScope){
    console.log('create table',$rootScope);
    var entityId = lbs.cbos.generateCode();
    var message = {
        "op": "ams_create_entity",
        "pl": {
            "table": {
                "ufid":entityId,
                "parent": lbs.cbos.user.desktop.apps[$state.params.appName].canvasesnav[$state.params.canvasName].eid,
                "name": "Table-"+entityId,
                "desc": "my test table",
                fields: [{fn:"GUID",ft:'String', fid:entityId }],
                views: [{vid: entityId, vn:"View-"+ entityId, vfields:[{fid:entityId}]}],
                forms: [{fid: entityId, name: "Form-"+entityId, ffields:[{fid:entityId, ufid: entityId}],ufid: entityId }],
                "dvid": entityId,
                "dfid": entityId
            }
        }
    };
    //console.log('creating table message-----',message);
    return lbs.cbos.message(message).then(function(response){
        // console.log('table created ------}}}}}}}}}}}}}}}}====',response);
        if(response&&response.pl&&response.pl.table){
            $scope.tcontainer.tables = $scope.tcontainer.tables||[];
            $scope.tcontainer.tables.push(response.pl.table);
            $scope.tcontainer.dropDownSelectedTable = response.pl.table;  //update default selected item in the tables select.ng-init is being used only on page load.
            $scope.tcontainer.dropDownSelectedView = response.pl.table.views?response.pl.table.views[0]:null;  //update default selected item in the views select.ng-init is being used only on page load.
            $scope.tcontainer.tables.forEach(function(table){
                if(table){
                    table.fieldnav = _.indexBy(table.fields,'fid');
                    table.viewnav = _.indexBy(table.views,'vid');
                }
            });
            $scope.tcontainer.tablesnav = _.indexBy($scope.tcontainer.tables,'ufid')||{};
            console.log('created table(s) indexed====', $scope.tcontainer.tablesnav );
            console.log('created table(s) indexed[$state.params.tableId]]====',$state.params.tableId, $scope.tcontainer.tablesnav[$state.params.tableId]);
            lbs.cbos.user.desktop.apps[$state.params.appName].canvasesnav[$state.params.canvasName].tables = $scope.tcontainer.tables;
            lbs.cbos.user.desktop.apps[$state.params.appName].canvasesnav[$state.params.canvasName].tablesnav = $scope.tcontainer.tablesnav;

            $state.go('desktop.app.canvas.tables.table.view.field',{tableId:entityId,viewId:entityId,fieldId:entityId});


        }
    });

};

lbs.cbos.lib.fillup = function (list, pageSize) {
    var add = pageSize - (list.length % pageSize),
        i = -1,
        ret = [];

    add = (add === pageSize) ? 0 : add;
    add = (list.length === 0) ? pageSize : add; //0%10 is 0 so no padding is added, need to add on empty lists as well
    add = list.length + add;
    while (++i < add) {
        ret.push(list[i] || {});
    }
    return ret;
};


function getAllElementsByAttribute(attribute)
{
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++)
    {
        if (allElements[i].getAttribute(attribute) !== null)
        {
            // Element exists with attribute. Add to array.
            matchingElements.push(allElements[i]);
        }
    }
    return matchingElements;
}


function getAllElementsByAttributeValue(attribute,value)
{
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++)
    {
        if ((allElements[i].getAttribute(attribute) !== null)&&(allElements[i].getAttribute(attribute) === value))
        {
            matchingElements.push(allElements[i]);
        }
    }
    return matchingElements;
}



function getAllElementsByTagNameAttributeValue(tagName,attribute,value)
{
    var matchingElements = [];
    var allElements = document.getElementsByTagName(tagName);
    for (var i = 0, n = allElements.length; i < n; i++)
    {
        var attr = allElements[i].getAttribute(attribute);
        if (attr&&attr === value)
        {
            matchingElements.push(allElements[i]);
        }
    }
    return matchingElements;
}