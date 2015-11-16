/**
 * Created by LBS006 on 1/30/15.
 */
module.exports = function (paramMongoose){
    var counterSchema = new paramMongoose.Schema({
        //_id: {type:paramMongoose.Schema.Types.ObjectId,required:true} // mongodb automatically create this one for us.
       _id: String
       ,seq:Number
    });
    return counterSchema;
};