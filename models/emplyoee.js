const mongoose = require("mongoose");

const emplyoeeSchema = mongoose.Schema(
{
        empid:{
            type:Number,
            require:true,
            maxlength:10
        },
        name:{
            type:String,
            require:true
        },
        photo:{
            type:String,
            require:true
        },
        role:{
            type:String,
            require:true
        }, 
        remarks:{
            type:String,
            require:true
        }
    }
);

const eoperation = mongoose.model("ExcelSoft",emplyoeeSchema,);

module.exports = eoperation;