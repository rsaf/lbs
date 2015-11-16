/**
 * Created by LBS006 on 12/16/14.
 */

module.exports = function (paramMongoose, paramFormSchema){

    var responseSchema = new paramMongoose.Schema({
        ct: { //creator
            uID: {type:paramMongoose.Schema.Types.ObjectId,required:true},//id of the user who created the service
            oID: {type:paramMongoose.Schema.Types.ObjectId,required:true},//organisation id
            cd: {type: Date, default: Date.now}//creation date
        },
        md: {//modified
            uID: {type:paramMongoose.Schema.Types.ObjectId,required:true},//id of user who changed the service
            oID: {type:paramMongoose.Schema.Types.ObjectId,required:true},//organisation id
            lu: {type:Date,required:true}//last updated date
        },
        dp: { //database identifiers properties
            pi: {type: paramMongoose.Schema.Types.ObjectId, required: true, unique: true}, //photo id
            ac: {type: paramMongoose.Schema.Types.ObjectId}, //business activity code
            ui: {type: paramMongoose.Schema.Types.ObjectId}, //user account identify code
            tc: {type: paramMongoose.Schema.Types.ObjectId}, //business transaction code
            Rp: {type: paramMongoose.Schema.Types.ObjectId, ref: 'Respondent'} //respondent
        },
        fd:paramFormSchema, // form definition
        sb:[ //service bookings
            {sid: {type: paramMongoose.Schema.Types.ObjectId},  //service id
             sn: String,   // service name
             sp: Number,  // service price
             cs: String, // consumption status
             ct: {type: Date},  //consumption time
             ps: String, // payment status
             pt: {type: Date}, // payment time
             sq: Number    // sequence number
            }
        ], // serviceBookings
        sp: { // service payment
            pa: Number, // payment amount
            ps: String // payment status
        }
    });
    return responseSchema;
};

