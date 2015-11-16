var htmlArea = "";

var imageobj = '';

var global_button = '';
var global_id = '';
var btnobj;




jQuery(document).ready(function ($) {
  
  //tabel rows, columns, rowHeight, columnHeight, lineType, lineThickness
  //tabel tabelTitle, tabelSummary

  //button name, value, type

  //Text  name, value, charWidth, maxChar, type, requried

  //radio name, requried, value

  //textarea name, textLimit, rows, requried, initalValue

  //checkbox name, requried, value

  //dropdown name, width, optionsText, optionsValue
  
  var saveForm = function saveForm(popupName){
    var blo = htmlArea.toHtmlString();
    var formMeta = lbs["workspace:nomenu"].publishing.activities.businessActivity.fm||{fd:{}};
    var uuid = formMeta.fd.uuid;
    var title = formMeta.fd.fmn || "";
    if(popupName||(title==="")){
      title = prompt("Form Name:", title);
    }
    var formid = formMeta._id;
    if (title.trim() === ""){
      alert("please specify a name");
    }
    else{
      var data = {
        form:{
          _id:formid
          ,fd:{
            fmn:title
            ,uuid:uuid
          }
        }
        ,html:blo
      };
      var method = 'POST';
      if (formid){
        method='PUT';
      }
      lbs.modHelper.getMessage('/workspace/activities/form.json',false,{},method,{json:JSON.stringify(data)})
      .then(function(msg){
        lbs["workspace:nomenu"].publishing.activities.savedFormMeta(msg.pl);
        formid=msg.pl._id;
      })
    }
    
  }

  var currentPopup = "";
  // $('#tabs').tab();
  var closePopup = function () {
    //Hide all popup components
    $("div[data-type='popup']").hide();

  };
  var currentComponent = {};
  var htmlArea;



  $("#generatedCode").htmlarea({
    toolbar: [],
    loaded: function () {
      htmlArea = this;
      // htmlArea.resizing(true);
      // self.pasteHTML('<script src="js/bootstrap.min.js"></script>');
      // self.pasteHTML('<link href="css/bootstrap.min.css" rel="stylesheet">');
      $(htmlArea.editor.head).append('<style>table td{border:1px solid;}</style>');
      // $(htmlArea.editor.head).append('<link href="css/bootstrap.min.css" rel="stylesheet">');
      // $(htmlArea.editor.head).append('<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/smoothness/jquery-ui.css"/>');


    }
  });
  var addComponent = function () {


    // console.log($("div[data-type='popup'][data-value='" + currentPopup + "']").find("[data-key]"));
    $("div[data-type='popup'][data-value='" + currentPopup + "']").find("[data-key]").each(function (index) {
      // console.log(index + ": " + $(this).text());


      //build the data object for json2html transform
      currentComponent[$(this).attr('data-key')] = $(this).val();
      // console.log($(this).val(), $(this).attr('data-key'), $(this));
    });
    console.log(global_button);


    if (global_button == 'table')
    {

      var row = currentComponent['rows'];
      row = row - 1;
      var rowCount = $(htmlArea.iframe).contents().find('table#' + global_id + ' tr:last').index() + 1;
      var col = currentComponent['columns'];
      var columnHeight = currentComponent['columnHeight'];
      var rowHeight = currentComponent['rowHeight'];
      var tableid = $(htmlArea.iframe).contents().find("#" + global_id);

      console.log(columnHeight + 'height' + row);

      if (rowCount > row)
      {
        console.log('lesser')
        tableid.find("tr:gt(" + row + ")").remove();
      }
      else if (rowCount <= row)
      {
        rowadd = row + 1;
        var diffrows = rowadd - rowCount;


        for (var j = 0; j < diffrows; j++)
        {
          var colls = "";
          for (var i = 0; i < col; i++)
          {
            colls = colls + '<td class="col" style="width:' + columnHeight + '"px;"></td>';
          }
          console.log(colls);
          tableid.append('<tr class="row" style="height:' + rowHeight + 'px">' + colls + '</tr>');
        }

      }

      //columns 

      var totalcolumns = tableid.find("tr:first > td").length;
      if (col > totalcolumns)
      {
        var coldif = col - totalcolumns;
        for (var i = 0; i < coldif; i++)
        {

          tableid.find("tr").each(function () {
            $(this).append('<td class="col" style="width:' + columnHeight + 'px;"></td>');
          })
        }

      }
      else
      {
        coldif = col - 1;
        tableid.find("tr").each(function () {
          $(this).find("td:gt(" + coldif + ")").remove();
        })
      }


      //css changes 



      global_button = '';
      global_id = '';
      return false;




    }


    if (global_button == 'checkbox')
    {


      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';
    }
    if (global_button == 'radio')
    {
      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';

    }
    if (global_button == 'text')
    {
      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';

    }
    if (global_button == 'textarea')
    {
      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';

    }
    if (global_button == 'dropdown')
    {
      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';

    }
    if (global_button == 'button')
    {
      $(htmlArea.iframe).contents().find('#' + global_id + '').remove();

      global_button = '';

    }






    if (currentPopup == '照片'){
      lbs.modHelper.getView('/workspace/publishing/formtool/js/uploadimage.html')
      .then(function(view){
        //@todo: edit is not yet suppored
        //get the correct index
        var index = htmlArea.getPhotoIndex();
        var html = Mustache.render(
          view,
          {
            standard:JSON.stringify(lbs['workspace:nomenu'].publishing['activities:form:new'].photoStandard),
            index:index
          }
        );
        htmlArea.pasteHTML(
          html
        );  
      });
      return false;
    }

    currentComponent['test'] = Math.floor(Math.random() * 10000000);


    if (currentPopup == 'image')
    {
      console.log(currentComponent['columnHeight']);

    }

    console.log('current component----',currentComponent);

    //json2html(jsondata, htmltransform);   templateObject has all the necessary types we need.

    var generatedComp = json2html.transform(currentComponent, templateObject[currentPopup]);



    console.log('generatedComp----',generatedComp);


    //USAGE
    //var retval = TextRange.pasteHTML(html);  paste html and replace current text and html element;

    var x = htmlArea.pasteHTML(generatedComp);

    htmlArea.display('inline-block');


    // .contents().find("body").append(scriptTag);
    //$(htmlArea.iframe).contents().find("img").draggable();
    $(htmlArea.iframe).contents().find("img").resizable({
      ghost: true,
      handles: "n, e, s, w"
    });
    $(htmlArea.iframe).contents().find("table").resizable({
      ghost: true,
      handles: "n, e, s, w"
    });
    // REDIPS.table.cell_index(true);
    // // define background color for marked cell
    // REDIPS.table.color.cell = '#9BB3DA';
    // REDIPS.table.onmousedown('mainTable', true,'classname');
    REDIPS.table.cell_index(true);
    // define background color for marked cell
    REDIPS.table.color.cell = '#9BB3DA';

    REDIPS.table.onmousedown('t' + currentComponent.test, true);
    //eval("var REDIPS=REDIPS||{};REDIPS.table=(function(){console.log('init');var onmousedown,handler_onmousedown,merge,merge_cells,max_cols,split,get_table,mark,cell_init,row,column,cell_list,relocate,remove_selection,cell_index,cell_ignore,tables=[],td_event,show_index,color={cell:false,row:false,column:false},mark_nonempty=true;onmousedown=function(el,flag,type){var td,i,t,get_tables;get_tables=function(el){var arr=[],nodes,i;nodes=$(el[0]).contents().find('table');for(i=0;i<nodes.length;i++){arr.push(nodes[i])}return arr};td_event=flag;if(typeof(el)==='string'){if(type==='classname'){tables=get_tables(document.getElementsByTagName('iframe'))}else{console.log(el);el=document.getElementsByTagName('iframe')[0].contentDocument.getElementById(el);console.log(el)}}if(el&&typeof(el)==='object'){if(el.nodeName==='TABLE'){tables[0]=el}else{tables=get_tables(el)}}for(t=0;t<tables.length;t++){td=tables[t].getElementsByTagName('td');for(i=0;i<td.length;i++){cell_init(td[i])}}cell_index()};cell_init=function(c){if(c.className.indexOf('ignore')>-1){return}if(td_event===true){REDIPS.event.add(c,'mousedown',handler_onmousedown)}else{REDIPS.event.remove(c,'mousedown',handler_onmousedown)}};cell_ignore=function(c){if(typeof(c)==='string'){c=document.getElementById(c)}REDIPS.event.remove(c,'mousedown',handler_onmousedown)};handler_onmousedown=function(e){var evt=e||window.event,td=evt.target||evt.srcElement,mouseButton,empty;empty=(/^\s*$/.test(td.innerHTML))?true:false;if(REDIPS.table.mark_nonempty===false&&empty===false){return}if(evt.which){mouseButton=evt.which}else{mouseButton=evt.button}if(mouseButton===1){console.log('mdown');td.redips=td.redips||{};if(td.redips.selected===true){mark(false,td)}else{mark(true,td)}}else if(mouseButton==3){REDIPS.table.merge('h',false);REDIPS.table.merge('v')}};merge=function(mode,clear,table){var tbl,tr,c,rc1,rc2,marked,span,id,cl,t,i,j,first={index:-1,span:-1};remove_selection();tbl=(table===undefined)?tables:get_table(table);for(t=0;t<tbl.length;t++){cl=cell_list(tbl[t]);tr=tbl[t].rows;rc1=(mode==='v')?max_cols(tbl[t]):tr.length;rc2=(mode==='v')?tr.length:max_cols(tbl[t]);for(i=0;i<rc1;i++){first.index=first.span=-1;for(j=0;j<=rc2;j++){id=(mode==='v')?(j+'-'+i):(i+'-'+j);if(cl[id]){c=cl[id];c.redips=c.redips||{};marked=c?c.redips.selected:false;span=(mode==='v')?c.colSpan:c.rowSpan}else{marked=false}if(marked===true&&first.index===-1){first.index=j;first.span=span}else if((marked!==true&&first.index>-1)||(first.span>-1&&first.span!==span)){merge_cells(cl,i,first.index,j,mode,clear);first.index=first.span=-1;if(marked===true){if(clear===true||clear===undefined){mark(false,c)}marked=false}}if(cl[id]){j+=(mode==='v')?c.rowSpan-1:c.colSpan-1}}if(marked===true){merge_cells(cl,i,first.index,j,mode,clear)}}}cell_index()};merge_cells=function(cl,idx,pos1,pos2,mode,clear){var span=0,id,fc,c,i;fc=(mode==='v')?cl[pos1+'-'+idx]:cl[idx+'-'+pos1];for(i=pos1+1;i<pos2;i++){id=(mode==='v')?(i+'-'+idx):(idx+'-'+i);if(cl[id]){c=cl[id];span+=(mode==='v')?c.rowSpan:c.colSpan;relocate(c,fc);c.parentNode.deleteCell(c.cellIndex)}}if(fc!==undefined){if(mode==='v'){fc.rowSpan+=span}else{fc.colSpan+=span}if(clear===true||clear===undefined){mark(false,fc)}}};max_cols=function(table){var tr=table.rows,span,max=0,i,j;if(typeof(table)==='string'){table=document.getElementById(table)}for(i=0;i<tr.length;i++){span=0;for(j=0;j<tr[i].cells.length;j++){span+=tr[i].cells[j].colSpan||1}if(span>max){max=span}}return max};split=function(mode,table){var tbl,tr,c,cl,rs,n,cols,max,t,i,j,get_rowspan;get_rowspan=function(c,row,col){var rs,last,i;rs=0;last=row+c.rowSpan-1;for(i=col-1;i>=0;i--){if(cl[last+'-'+i]===undefined){rs++}}return rs};remove_selection();tbl=(table===undefined)?tables:get_table(table);for(t=0;t<tbl.length;t++){cl=cell_list(tbl[t]);max=max_cols(tbl[t]);tr=tbl[t].rows;for(i=0;i<tr.length;i++){cols=(mode==='v')?max:tr[i].cells.length;for(j=0;j<cols;j++){if(mode==='v'){c=cl[i+'-'+j];if(c!==undefined){c.redips=c.redips||{}}if(c!==undefined&&c.redips.selected===true&&c.rowSpan>1){rs=get_rowspan(c,i,j);n=tr[i+c.rowSpan-1].insertCell(j-rs);n.colSpan=c.colSpan;c.rowSpan-=1;cell_init(n);cl=cell_list(tbl[t])}}else{c=tr[i].cells[j];c.redips=c.redips||{};if(c.redips.selected===true&&c.colSpan>1){cols++;n=tr[i].insertCell(j+1);n.rowSpan=c.rowSpan;c.colSpan-=1;cell_init(n)}}if(c!==undefined){mark(false,c)}}}}cell_index()};get_table=function(table){var tbl=[];if(table!==undefined){if(typeof(table)==='string'){table=document.getElementById(table)}if(table&&typeof(table)==='object'&&table.nodeName==='TABLE'){tbl[0]=table}}return tbl};row=function(table,mode,index){var nc,nr=null,fr,c,cl,cols=0,i,j,k;remove_selection();if(typeof(table)!=='object'){table=document.getElementsByTagName('iframe')[0].contentDocument.getElementsByClassName(table)[0]}if(index===undefined){index=-1}if(mode==='insert'){fr=table.rows[0];for(i=0;i<fr.cells.length;i++){cols+=fr.cells[i].colSpan}nr=table.insertRow(index);for(i=0;i<cols;i++){nc=nr.insertCell(i);cell_init(nc)}cell_index()}else{if(table.rows.length===1){return}table.deleteRow(index);cl=cell_list(table);index=table.rows.length-1;cols=max_cols(table);for(i=0;i<cols;i++){c=cl[index+'-'+i];if(c===undefined){for(j=index,k=1;j>=0;j--,k++){c=cl[j+'-'+i];if(c!==undefined){c.rowSpan=k;break}}}else if(c.rowSpan>1){c.rowSpan-=1}i+=c.colSpan-1}}return nr};column=function(table,mode,index){var c,idx,nc,i;remove_selection();if(typeof(table)!=='object'){table=document.getElementById(table)}if(index===undefined){index=-1}if(mode==='insert'){for(i=0;i<table.rows.length;i++){nc=table.rows[i].insertCell(index);cell_init(nc)}cell_index()}else{c=table.rows[0].cells;if(c.length===1&&(c[0].colSpan===1||c[0].colSpan===undefined)){return}for(i=0;i<table.rows.length;i++){if(index===-1){idx=table.rows[i].cells.length-1}else{idx=index}c=table.rows[i].cells[idx];if(c.colSpan>1){c.colSpan-=1}else{table.rows[i].deleteCell(index)}i+=c.rowSpan-1}}};mark=function(flag,el,row,col){var cl;if(typeof(flag)!=='boolean'){return}if(typeof(el)==='string'){el=document.getElementById(el)}else if(typeof(el)!=='object'){return}if(el.nodeName==='TABLE'){cl=cell_list(el);el=cl[row+'-'+col]}if(!el||el.nodeName!=='TD'){return}el.redips=el.redips||{};if(typeof(REDIPS.table.color.cell)==='string'){if(flag===true){el.redips.background_old=el.style.backgroundColor;el.style.backgroundColor=REDIPS.table.color.cell}else{el.style.backgroundColor=el.redips.background_old}}el.redips.selected=flag};remove_selection=function(){if(window.getSelection){window.getSelection().removeAllRanges()}else if(document.selection&&document.selection.type===\"Text\"){try{document.selection.empty()}catch(error){}}};cell_list=function(table){var matrix=[],matrixrow,lookup={},c,ri,rowspan,colspan,firstAvailCol,tr,i,j,k,l;tr=table.rows;for(i=0;i<tr.length;i++){for(j=0;j<tr[i].cells.length;j++){c=tr[i].cells[j];ri=c.parentNode.rowIndex;rowspan=c.rowSpan||1;colspan=c.colSpan||1;matrix[ri]=matrix[ri]||[];for(k=0;k<matrix[ri].length+1;k++){if(typeof(matrix[ri][k])==='undefined'){firstAvailCol=k;break}}lookup[ri+'-'+firstAvailCol]=c;for(k=ri;k<ri+rowspan;k++){matrix[k]=matrix[k]||[];matrixrow=matrix[k];for(l=firstAvailCol;l<firstAvailCol+colspan;l++){matrixrow[l]='x'}}}}return lookup};relocate=function(from,to){var cn,i,j;if(from===to){return}cn=from.childNodes.length;for(i=0,j=0;i<cn;i++){if(from.childNodes[j].nodeType===1){to.appendChild(from.childNodes[j])}else{j++}}};cell_index=function(flag){if(flag===undefined&&show_index!==true){return}if(flag!==undefined){show_index=flag}var tr,c,cl,cols,i,j,t;for(t=0;t<tables.length;t++){tr=tables[t].rows;cols=max_cols(tables[t]);cl=cell_list(tables[t]);for(i=0;i<tr.length;i++){for(j=0;j<cols;j++){if(cl[i+'-'+j]){c=cl[i+'-'+j]}}}}};return{color:color,mark_nonempty:mark_nonempty,onmousedown:onmousedown,mark:mark,merge:merge,split:split,row:row,column:column,cell_index:cell_index,cell_ignore:cell_ignore}}());if(!REDIPS.event){REDIPS.event=(function(){var add,remove;add=function(obj,eventName,handler){if(obj.addEventListener){obj.addEventListener(eventName,handler,false)}else if(obj.attachEvent){obj.attachEvent('on'+eventName,handler)}else{obj['on'+eventName]=handler}};remove=function(obj,eventName,handler){if(obj.removeEventListener){obj.removeEventListener(eventName,handler,false)}else if(obj.detachEvent){obj.detachEvent('on'+eventName,handler)}else{obj['on'+eventName]=null}};return{add:add,remove:remove}}())}REDIPS.table.cell_index(true);REDIPS.table.color.cell = '#9BB3DA';REDIPS.table.onmousedown('t'+currentComponent.test, true);");

    console.log(currentComponent.test);
    /*     code clear  */



    /////////////////////////////////////////////clearing events ////////////////////////////////////
    $('input[type="reset"]').click();

    ///////////////////////////////


    currentPopup = '';

    //end 
    // console.log(self.get);
  };

  //get selected //
  $(htmlArea.iframe).contents().find("img").click(function () {
    console.log('click');
  });
  //end of get selected //


  $("#popupSave").on("click", function () {
    addComponent();
    //closePopup();
  });

  $("#popupCancel").on("click", function () {
    closePopup();

  });

  $("#generatedCode").on('change', function (evt) {
    console.log(this);
  });

  //Add all popup components to modal-body i.e, popup
  //$("div[data-type='popup']").appendTo($(".modal-body"));

  //Add all popup components to Slide Toggle
  $("div[data-type='popup']").appendTo($(".slide-modal-content"));

  // merge button for table // 
  $('.tblm').on("click", function (evt) {
    REDIPS.table.merge('h', false);
    // and then merge cells vertically and clear cells (second parameter is true by default)
    REDIPS.table.merge('v');
  })

  //split table  horizontally and vertically //
  $('.tblsh').on("click", function (evt) {
    REDIPS.table.split('h');

  })
  $('.tblsv').on("click", function (evt) {

    REDIPS.table.split('v');
  })


  //

  $("button[data-value='new']").on("click", function (evt) {
    console.log("new");
  })




  //Add / Show content related to selected component
  $("button[data-type='component']").on("click", function (evt) {
    console.log(evt, this);

    //Hide all popup components
    $('#slideToggle').hide().parent().removeClass('slide-open');
    $("div[data-type='popup']").hide();

    //$("#myModalLabel").text($(this).attr("data-value") + " Properties");

    // Comment the above line and uncomment the below line

    // $("#myModalLabel").text($(this).attr("data-title"));

    //Show selected component related content in popup
    if ($(this).attr("data-value") == 'image1') {
      // evt.preventDefault();
      // closePopup();
      //$('#uploadImage').click();

    } else {
      $("div[data-type='popup'][data-value='" + $(this).attr("data-value") + "']").show();
      currentPopup = $(this).attr("data-value");
      $('#slideToggle').slideDown().parent().addClass('slide-open');
    }
  });

  $('#closeSlider').click(function () {
    $('#slideToggle').slideUp().parent().removeClass('slide-open');



    addComponent();

  });



  $('#uploadImage').on('change', function () {
    console.log('upload image');
    if (this.files && this.files[0]) {
      var reader = new FileReader();

      var fsize = this.files[0].size/1024;

      console.log('image size----',fsize);

      if(fsize>200){
        alert('照片大小不能大于200KB!');
        return;
      }

      reader.onload = function (e) {
        imageobj = e;
        htmlArea.pasteHTML('<img  src=' + imageobj.target.result + ' height=' + currentComponent['columnHeight'] + ' width=' + currentComponent['columnWidth'] + ' />');
        $('input[type="reset"]').click();

        //htmlArea.image(e.target.result);
      };
      reader.readAsDataURL(this.files[0]);

    }
  });


  $('#fontName').on('change', function () {
    // alert(this.value); // or $(this).val()
    htmlArea.fontName(this.value);
  });
  $('#fontSize').on('change', function () {
    // alert(this.value); // or $(this).val()
    htmlArea.fontSize(this.value);
  });
  var dvalue = 0;
  $('button[data-class="colorPicker1"]').click(function () {
    dvalue = $(this).attr('data-value');


    console.log('cond1' + dvalue)
    $('.colpick').show();
    $('.colorPiker1').colpick({
      flat: true,
      layout: 'hex',
      onSubmit: function (hsb, hex, rgb, el) {
        console.log(dvalue + "final dvalue");
        if (dvalue == "foreground") {
          htmlArea.forecolor("#" + hex);
        } else {
          htmlArea.backgroundColor("#" + hex);
        }

        $(el).colpickHide();

      },
      onBeforeShow: function () {
        $(this).colpickSetColor(this.value);
      }
    })
            .bind('keyup', function () {
              $(this).colpickSetColor(this.value);
            });


  })


  $('#popupPicker').colpick({
    flat: true,
    layout: 'hex',
    submit: 0,
    // // colorScheme: 'dark',
    onChange: function (hsb, hex, rgb, el, bySetColor) {
      // $(el).css('background-color', '#' + hex);
      // Fill the text box just if the color was set using the picker, and not the colpickSetColor function.
      if (!bySetColor)
        $(el).val(hex);


      $('#rvalue').val(rgb.r);
      $('#gvalue').val(rgb.g);
      $('#bvalue').val(rgb.b);
    },
  }).keyup(function () {
    $(this).colpickSetColor(this.value);
  });

  //Add properties to selected component
  $("button[data-type='property']").on("click", function (evt) {
    // console.log(evt, this);
    // self.getSelection();
    switch ($(this).attr("data-value")) {
      case 'bold':
        htmlArea.bold();
        break;
      case 'italic':
        htmlArea.italic();
        break;
      case 'underline':
        htmlArea.underline();
        break;
      case 'strikethrough':
        htmlArea.strikeThrough();
        break;
      case 'alignleft':
        htmlArea.justifyLeft();
        break;
      case 'alignright':
        htmlArea.justifyRight();
        break;
      case 'alignmiddle':
        htmlArea.justifyCenter();
        break;
      case 'distributed':
        htmlArea.justifyFull();
        break;
      case 'foreground':
        //htmlArea.forecolor();
        break;
      case 'background':
        //     htmlArea.backgroundColor();
        break;
      case 'decreaseFont':
        console.log('decreaseFont');
        htmlArea.decreaseFontSize();
        break;
      case 'increaseFont':
        htmlArea.increaseFontSize();
        break;

      default:
        console.log("Unknown Property" + $(this).attr("data-value"));
    }

  });
  $("button[data-type='action']").on("click", function (evt) {
    // console.log(evt, this);
    // self.getSelection();
    var blob;
    switch ($(this).attr("data-value")) {
      case 'design':
        $(htmlArea.iframe).contents().find("table").draggable();
        $(htmlArea.iframe).contents().find("table").resizable();
        $(htmlArea.iframe).contents().find("img").draggable();

        htmlArea.readOnly(false);
        htmlArea.editor.designMode = "on";

        htmlArea.hideHTMLView();
        break;
      case 'code':
        htmlArea.readOnly(false);
        htmlArea.editor.designMode = "on";

        htmlArea.showHTMLView();
        break;
      case 'preview':
        htmlArea.editor.designMode = "off";
        htmlArea.hideHTMLView();
        htmlArea.readOnly(true);
        break;
      case 'undo':
        htmlArea.undo();
        break;
      case 'redo':
        htmlArea.redo();
        break;
      case 'print':
        htmlArea.iframe[0].contentWindow.print();
        break;
      case 'save':
        saveForm(false);
        break;
      case 'saveas':
        saveForm(true);
        break;
      case 'new' :
        $(htmlArea.iframe).contents().find("body").html("");
        break;

      case 'saveboot':



        $(".dividized").html(htmlArea.html());

        $('table').addClass('mytable');

        jQuery(document).ready(function () {
          jQuery('.mytable').dividize({
            removeHeaders: false,
            addLabelHeaders: true,
            hideLabels: true,
            preserveEvents: true,
            preserveDim: true,
            classes: 'test-table',
            enableAltRows: true
          });
        });
        var boot = $('.dividized').html();
        console.log(boot);
        blob = new Blob([boot], {
          type: "text/html;charset=utf-8"
        });
        saveAs(blob, "bootstrap.html");
        break;

      default:
        console.log("Unknown Action" + $(this).attr("data-value"));
    }

  });
  var formUrl = lbs.util.getMember(lbs["workspace:nomenu"],"publishing.activities.businessActivity.fm.fd.uri".split("."));
  if(formUrl){
    lbs.modHelper.getView(formUrl,false)
    .then(function(formContent){
      jQuery('iframe').contents().find('body').html(formContent);
    });
  }
});




$('.action-switch-button').click(function (e) {
  e.preventDefault();
  $(this).addClass('ft-white-gb swallow-border');
  $(this).siblings('.ft-white-gb.swallow-border').removeClass('ft-white-gb swallow-border');

  if ($(this).hasClass('norm-param-button')) {

    if ($('.norm-param-form').hasClass('hideDiv')) {


      $('.norm-param-form').removeClass('hideDiv').addClass('showDiv');


      if (!$('.norm-param-form').hasClass('hideDiv')) {
        $('.make-param-form').addClass('hideDiv');

      }

    }


  }
  else if ($(this).hasClass('make-param-button')) {
    if ($('.make-param-form').hasClass('hideDiv')) {
      $('.make-param-form').removeClass('hideDiv').addClass('showDiv');
      if (!$('.norm-param-form').hasClass('hideDiv')) {
        $('.norm-param-form').addClass('hideDiv');

      }
    }
  }
});



/* edit functions for double click and show the form element properties in the dropdown */
$(document).ready(function () {
  $('iframe').contents().find('body').dblclick(function (e) {
    var iid = e.target.id;
    var tabletarget = e.target.className;
    if (!iid)
    {
      console.log(e.target.innerHTML);
      if (!e.target.innerHTML)
      {
        console.log('is null');
        var parenttable = e.target.offsetParent.id;
        $('button[data-value="table"]').click();
        global_button = 'table';
        global_id = e.target.offsetParent.id;

      }
    }
    else
    {

      console.log($('#' + iid).attr('data-class'));
      var elem = $('iframe').contents().find('#' + iid);
      dvalue = elem.data('class');
      $('button[data-value="' + dvalue + '"]').click();
      global_button = dvalue;
      global_id = iid;
      btnobj = $('iframe').contents().find('#' + global_id).clone();
      console.log(btnobj);
      if (dvalue == 'checkbox')
      {
        var name = btnobj.attr('data-name');
        var req = btnobj.attr('verification');
        var text = btnobj.find('input[type="checkbox"]')[0].attributes[2].nodeValue;
        var x = $("div[data-type='popup'][data-value='checkbox']").find("[data-key]").each(function (index) {
        })

        x[0].value = name;
        x[1].value = req;
        x[2].value = text;
      }

      else if (dvalue == 'radio')
      {
        var name = btnobj.attr('data-name');
        var req = btnobj.attr('verification');
        var text = btnobj.find('input[type="radio"]')[0].attributes[4].nodeValue;
        var x = $("div[data-type='popup'][data-value='radio']").find("[data-key]").each(function (index) {
        })
        console.log(x);
        x[0].value = name;
        x[1].value = req;
        x[2].value = text;
      }

      else if (dvalue == 'text')
      {
        var name = btnobj.attr('data-name');
        var req = btnobj.attr('verification');
        var value = btnobj.attr('value');
        var height = btnobj.attr('height');
        var type = btnobj.attr('type');
        var width = btnobj.attr('size');

        var x = $("div[data-type='popup'][data-value='text']").find("[data-key]").each(function (index) {
        })

        x[0].value = name;
        x[1].value = value;
        x[2].value = height;
        x[3].value = width;
        x[4].value = type;
        x[5].value = req;

      }

      else if (dvalue == 'textarea')
      {
        var name = btnobj.attr('data-name');
        var req = btnobj.attr('verification');
        var value = btnobj.attr('value');
        var height = btnobj.attr('rows');

        var width = btnobj.attr('cols');

        var x = $("div[data-type='popup'][data-value='textarea']").find("[data-key]").each(function (index) {
        })

        x[0].value = name;
        x[1].value = height;
        x[2].value = width;
        x[3].value = req;
        x[4].value = value;
      }
      else if (dvalue == 'button')
      {
        var name = btnobj.attr('data-name');
        var req = btnobj.attr('verification');
        var value = btnobj.attr('value');
        var height = btnobj.attr('height');

        var width = btnobj.attr('size');

        var x = $("div[data-type='popup'][data-value='button']").find("[data-key]").each(function (index) {
        })
        console.log(x);
        x[0].value = name;
        x[2].value = height;
        x[3].value = width;

      }
    }
  })

})


var counterr = 0;
var resizeinit = 0;
$(window).resize(function () {

  if (resizeinit == '0')
  {

    var origtable = $('iframe').contents().find('body').html();
    $(".origform").html(origtable);

  }

  var x = $('iframe').contents().find('table').width();
  var y = $('iframe').contents().find('body').width();


  if (x > y)
  {
    counterr = y;
    console.log(counterr);
    console.log("x is greater than y");
    var table = $("iframe").contents().find("table");
    table.find('td').unwrap().wrap($('<tr/>'));
    var resizehtml = $('iframe').contents().find('body').html();
    $(".resizform").html(resizehtml);
  }
  else
  {
    console.log("counterr" + counterr + "window width" + y)
    if (y > counterr && counterr != 0) {
      console.log("main");
      var mainhtml = $(".origform").html();
      console.log(mainhtml);
      $('iframe').contents().find('body').html(mainhtml);

    }
    resizeinit = 0;
    return 0;

  }
  resizeinit = 1;
});


/* end */
