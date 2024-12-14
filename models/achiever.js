const mongoose = require("mongoose");

const achivierSchema = mongoose.Schema(
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
        },
        category:{
            type:String,
            require:true
        },
        quarter:{
            type:String,
            require:true
        },
    }
);

const aoperation = mongoose.model("ExcelSoftachiever",achivierSchema,);

module.exports = aoperation;