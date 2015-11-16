 rsync -avz --exclude 'bower_components' --exclude 'node_modules' lbs.cbos.web/ spider@cbos:sites/spa.saascbos.com.static/

Tables Data Types
http://mongoosejs.com/docs/schematypes.html

 String
 Number
 Date
 Boolean
 Blob (Store as object definition in db {name:String, uuid: String, ltf: String, ufid: String, size: Number, ext: String, type: String})
 Expression (Store as string in db {type:String} example: [quantity] * [unit price] where quantity and unit price are fields names)
 Choice  (Store as arrary of string in db == > Array[String])
 Lookup (Store as object definition in db {parent:_id, field:{Choice}, projections:[{fields}]}), this are coming from a different table


 Forms Input Types (HTML5)
 text, password, radio, checkbox, date, datetime, email,month, number, range, tel, time, url, week
 http://www.w3schools.com/html/html_form_input_types.asp

 String --> (text --> (single-line, multiple-line), email, tel, url)
 Number --> (number, range)
 Date -->  (date, datetime)
 Boolean --> (radio)
 Blob --> ( images,files)
 Expression --> (shown as label not input)
 Choice -- > (Choice --> (radio, checkbox, dropdown -->(single choice, multiple choice )))
 Lookup --> (Choice --> (radio, checkbox, dropdown -->(single choice, multiple choice )))

  //var message = {m:{pl:{"from": "leo@cbos.com", "to": "leo@cbos.com"}}};
     //$.post('/api/apply.json',message).then(function(response){
     //        console.log('post successful', response);
     //    },
     //    function(response){
     //        console.log('post NOT successful', response);
     //    });





