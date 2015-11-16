var templateObject;
$(document).ready(function($) {
    //tabel rows, columns, rowHeight, columnHeight, lineType, lineThickness
    //tabel tabelTitle, tabelSummary

    //button name, value, type

    //Text  name, value, charWidth, maxChar, type, requried

    //radio name, requried, value

    //textarea name, textLimit, rows, requried, initalValue

    //checkbox name, requried, value

    //dropdown name, width, optionsText, optionsValue
    // $('input[type=file]').bootstrapFileInput();
    // $('.file-inputs').bootstrapFileInput();
    templateObject = {
        button: {
            "tag": "input id='t${test}' data-class='button' ",
            "data-name": "${inputValue}",
            "type": "date",
            "height": "${rowHeight}",
            "value": "",
            "data-default":"",//@todo: the default value isn't working here
            "data-verification": "${requried}",
            "size": "${rowWidth}",
            "class":"formToolElement form-control",
            "style": "line-height:${rowHeight}",
            "data-bind":"entity.fields.${inputValue}"
                // "disabled": "${disabled}"
        },
        text: {
            "tag": "input id='t${test}' data-class='text'",
            "type": "${type}",
            "data-name": "${name}",
            "height":"${columnHeight}",
            // "html": "${html}",
            "value": "${value}",
            "data-default": "${value}",
            "style": "line-height:${columnHeight}",
            "data-verification": "${requried}",
            "size": "${columnWidth}",
            "class": "form-control formToolElement",
            "data-bind":"entity.fields.${name}"
                // "placeholder": "${placeholder}",
        },
        checkbox: {
            "tag": "div id='t${test}' data-class='checkbox'",
            // "type": "checkbox",
            "data-name": "${name}",
            
            "children": function(obj, index) {
                var values = obj.value.split("\n");
                 var data = [];
                    $.each(values, function(index) {
                        data.push({
                           value: values[index],
                           requried: obj.requried
                        });

                    });
                return json2html.transform(data, {
                    "tag": "input",
                    "type": "checkbox",
                    "name":obj.name,
                    "value": "${value}",
                    "data-values":obj.value,
                    "html": "${value}",
                    "data-verification": "${requried}",
                    "data-bind":"entity.fields."+obj.name
                });
            },
            "data-verification": "${requried}",
            "class":"formToolElement"
            // "checked": "${checked}",
            // "disabled": "${disabled}"
        },

        radio: {
            "tag": "div id='t${test}' data-class='radio'",
            // "type": "checkbox",
            "data-name": "${name}",
            
            "children": function(obj, index) {
                var values = obj.value.split("\n");
                   var data = [];
                    $.each(values, function(index) {
                        data.push({
                           value: values[index],
                           requried: obj.requried
                        });

                    });
                return json2html.transform(data, {
                    "tag": "input",
                    "type": "radio",
                    "name":obj.name,
                    "data-values":obj.value,
                    "data-name": obj.name,
                    "value":"${value}",
                    "html": "${value}",
                    "data-verification": "${requried}",
                    "data-bind":"entity.fields."+obj.name
                });
            },
            "data-verification": "${requried}",
            "class":"formToolElement"
            //"disabled": "${disabled}"
        },


        textarea: {
            "tag": "textarea id='t${test}' data-class='textarea'",
            "data-name": "${name}",
            "rows": "${columnHeight}",
            "cols": "${columnWidth}",
            "data-verification": "${requried}",
            "maxlength": "${textLimit}",
            "value": "${initalValue}",
            "data-default": "${initalValue}",
            "html": "${initalValue}",
            "class":"formToolElement form-control",
            "data-bind":"entity.fields.${name}"
                // "disabled": "${disabled}",
                // "placeholder": "${placeholder}",
                // "maxlength": "${maxlength}",
                // "wrap": "${wrap}"
        },
        dropdown: {
            "tag": "select id='t${test}' data-class='dropdown'",
            "data-name": "${name}",
            "data-verification": "${requried}",
            "width": "${width}",
            "class": "form-control",
            "data-bind":"entity.fields.${name}",
            "children": function(obj, index) {
                    var values = obj.optionsText.split("\n");
                    var options = obj.optionsText.split("\n");
                    var data = [];
                    $.each(values, function(index) {
                        data.push({
                            displayField: options[index],
                            valueField: values[index]
                        });
                    });
                    return json2html.transform(data, {
                        "tag": "option",
                        "value": "${valueField}",
                        "html": "${displayField}"
                    });
                },
            "class":"formToolElement form-control"
                // "disabled": "${disabled}",
                // "multiple": "${multiple}",
                // "size": "${size}"
        },
        //tabel rows, columns, rowHeight, columnHeight, lineType, lineThickness
        //tabel tabelTitle, tabelSummary

        table: {
            "tag": "table class='mainTable' id='t${test}' data-class='table'",
            "summary": "${tabelSummary}",
            "style": function(obj) {
                return 'margin: 0 auto;border-collapse:collapse;';
            },
            "children": function(obj, index) {
                var rows = [];
                for (var i = 0; i < obj.rows; i++) {
                    rows.push(i);
                }

                var cols = [];
                for (var i = 0; i < obj.columns; i++) {
                    cols.push(i)
                }
                return json2html.transform(rows, {
                    "tag": "tr",
                    "class": "row",
                    "style": function() {
                        return 'height:' + obj.rowHeight + 'px;';
                        // + 'border:' + obj.lineThickness + 'px ' + obj.lineType + ' #000';
                    },
                    children: function() {
                        return json2html.transform(cols, {
                            "tag": "td",
                            "class": "col",
                            "style": function() {
                                return 'width:' + obj.columnHeight + 'px;' + 'border:' + obj.lineThickness + 'px ' + obj.lineType + ' #000';
                            }
                        });
                    }
                });
            }
        },
        imageTemplate: {
            "tag": "img id='t${test}' data-class='image'",
            "name": "${name}",
            "src": "${src}",
            "alt": "${alt}",
            "height": "${height}",
            "width": "${width}",
            "align": "${align}",
            "border": "${border}"
        },
        divTemplate: {
            "tag": "div",
            "style": "${style}",
            "children": [],
            "class":"formToolDivElement"
        }
    };

    // $("#imgUploadButton").click(function() {
    //     console.log("Hi---")
    //     $("input[id='fileInput']").click();
    // });

    // function chooseFile() {
    //     console.log("Hi")
    //     $("#fileInput").click();
    // }

    // $('#picker').colpick();

    jQuery('#uploadPhotoPropertyBtn').click(function(e){
        //alert('you want to edit property?');

        lbs['workspace:nomenu'].publishing['activities:form:new'].openPhotoStandard(e);
    });

    jQuery('#closeSlider').click(function(e){

        var targetBlox = jQuery('#photoNormsSelection');
        if(!targetBlox.is(':hidden')){
            lbs['workspace:nomenu'].publishing['activities:form:new'].closePhotoStandard(e);
            //alert('you want to close property?');
        }

    });

    jQuery('#inputType00').on('change',function(e){

        var sc = jQuery(e.target).val()
        lbs['workspace:nomenu'].publishing['activities:form:new'].photoStandardChange({e:e,sc:sc});
     });


});
