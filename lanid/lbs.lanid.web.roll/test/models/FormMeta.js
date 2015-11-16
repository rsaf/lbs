/**
 * Created by LBS006 on 12/19/14.
 */

module.exports = function (paramMongoose) {

    var FormMetaSchema = new paramMongoose.Schema({
        ct: { //creator
            uID: String,//id of the user who created the service
            oID: String,//organisation id
            cd: {type: Date, default: Date.now}//creation date
        },
        md: {//modified
            uID: String,//id of user who changed the service
            oID: String,//organisation id
            lu: {type: Date, required: true}//last updated date
        },
        siv:[{ // search index values, defines the values that need to be indexed
            in:String,  // name of the search index, example mobile number
            it: String  // type of the search index, String
        }],
        fd: { //form definition
            fields: [{ //fields in the form
                nm: String, //field name example 'Country'
                vl: String, //field value  example 'Germany'
                vt: String, //Number, String, Date, Boolean
                nv: {type: Boolean, default: false}, //need verified example false
                vr: Boolean, // verification result example true
                vd: Date //verified date example 2015/02/15
            }],
            pt:[{  //form photo
                pp:{ //original photo properties , this may be different (in terms of value) from the target photo property
                    tsc: String, //0 target IDPhoto Standard Code 证照代码 // this may be different from IDPhoto Standard Code
                    uc: String,  //1 Usage Code 证照用途（用途代码）
                    it: String,  //2 IDPhoto Category 证照类别
                    swp: String,  //3 Standard width 标准像宽pix
                    shp: String, //4 Standard Height 标准像高pix
                    hlp: String,  //5 Head length 头部长度pix
                    hlpe: String, //6 Head length error 头部长度误差值pix
                    cwp: String, //7 check width 脸颊宽度pix
                    cwpe: String, //8 check width error 脸颊宽度误差值pix
                    hdp: String, //9 Head distance 头顶距pix
                    hdpe: String, //10 head distance 头顶距误差值pix
                    bc: String, // 11 background color 背景颜色
                    bcr: String, //12 background color R 背景颜色R
                    bcg: String, //13 background color G 背景颜色G
                    bcb: String, //14 background color B 背景颜色B
                    bcr: String, //15 background color error RGB误差值
                    rs: String, //16 resolution 分辨率
                    fm: String, //17 format 图片格式
                    ss: String, //18 standard size 标准文件大小
                    osw: String, //19 output nominal size width 输出名义尺寸宽mm
                    osh: String, //20 output nominal size height 输出名义尺寸高mm
                    hlm: String, //21 head length 头部长度mm
                    hlme: String, //22 head length error 头部长度误差值mm
                    cwm: String, //23 check width 脸颊宽度mm
                    cwme: String,// 24 check width error 脸颊宽度误差值mm
                    hdm: String, //25 head distance 头顶距mm
                    hdme: String, //26 head distance error 头顶距误差值mm
                    ifm: String, //27 initial format 初始照片格式
                    ofs: String, //28 original photo size 初始照片文件大小
                    ifr: String, //29 original photo resolution 初始照片清晰度要求
                    rm: String //30 remarks 备注
                }, //photo properties
                pc:{
                pts: String,  // photo source     照片来源
                ptp: String,  // photo provider 照片提供
                psi: String,  // photo shooting index 拍摄索引
                ptp: String,  // photo uploading method 照片上传
                psr: Boolean, // photo needs inspection 检测要求
                pcr: Boolean, // photo needs correction  制作要求
                pwr: Boolean, // photo needs watermark 证照水印
                pwm: String,  // photo watermark method 水印模式
                prr: Boolean, // photo needs resizing    证照缩略
                prm: String,  // photo resizing method   缩略模式
                ppr: Boolean, // photo replacement requirement 替换限制
                pvr: Boolean, // Photo verification requirement 认证要求
                pcr: String,  // photo collection requirement   采集限定
                pds: String,  // photo data source access control        授权数据源
                pvm: String,  // photo verification method     认证方式
                psn: Number   // photo similarity number   对比阀值
                } // photo control properties
            }],
            fmn: String, //form name, default is business activity name
            uuid:String, //uuid of the html save to the storage bucket
            uri: String, //uniform resource indicator ,similar to url
            fcd: Date    // form creation date
        }
        ,fc:String //form code
    });
    return FormMetaSchema;
}






//fd: { //form definition
//    fields: [
//        { //fields in the form
//            nm: 'lastname', //field name example 'Country'
//            vl: null, //field value  example 'Germany'
//            dvl: 'Adda', //field default value 'China'
//            nv: true, //need verified example false
//            vr: null, // verification result example true
//            vd: null//verified date example 2015/02/15
//        },
//        { //fields in the form
//            nm: 'firstname', //field name example 'Country'
//            vl: null, //field value  example 'Germany'
//            dvl: 'John', //field default value 'China'
//            nv: true, //need verified example false
//            vr: null, // verification result example true
//            vd: null//verified date example 2015/02/15
//        },
//        { //fields in the form
//            nm: 'gender', //field name example 'Country'
//            op: ['Male','Female'],
//            vl: null, //field value  example 'Germany'
//            dvl: null, //field default value 'China'
//            nv: false, //need verified example false
//            vr: null, // verification result example true
//            vd: null//verified date example 2015/02/15
//        }
//    ]
//
//}
//

//var FormMeta = mongoose.model('FormMeta', formMetaSchema);
//
//// Each form submitted from the designer results in an instance of the FormMeta model:
//var form1meta = new FormMeta({
//    name:'form1',
//    uuid:'01234567-0123-0123-0123-0123456789AB',
//    author: loggedInUser._id
//});
//form1meta.save(function(err){
//    // TODO: handle errors/retry
//})
//
//// A new Mongoose schema corresponding to the data-component/name pairs in that form.
//
////For example, using local file:
////var fs = require("fs");
//fs.readFile("app.html", function(err,data) {
//    // TODO: Store the received HTML on the correct web-server (same algorithm as the images)
//
//    var Parser = require('parse5').Parser;
//    var parser = new Parser();
//    var fragment = parser.parseFragment(data.toString());
//    console.log(fragment);
//    // Iterate the html fragment DOM and populate name/data-component pairs
//});
//
//// In this case, the app.html would result in the following schema:
//var form1schema = mongoose.Schema({
//    "My checkbox": Boolean,
//    "My text": String,
//    "My textarea": String,
//    "My radio": String,
//    "My dropdown": String,
//    "My photo": {
//        data: Buffer
//        // Which of the parameters are actually part of a filled in form?
//    }
//});
//mongoose.model('Form1', form1schema);
//
//// When the user submits the filled form, create an instance of the form's model from the POST data
//var Form1 = mongoose.model('Form1');
//var form1_for_userX = new Form1({
//    "My checkbox": true,
//    "My text": "Text value",
//    "My textarea": "Textarea value",
//    "My radio": "Radio value2",
//    "My dropdown": "Dropdown value2",
//    "My photo": { data: new Buffer("from data-value", 'base64') }
//});
//
//// Save the form to MongoDB
//form1_for_userX.save(function(err){
//    // TODO: handle errors/retry
//});

