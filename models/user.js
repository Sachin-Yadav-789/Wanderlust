const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;


const userSchema =  new Schema({
    email : {
     type : String,
     required : true,
   }, 
    // here username and password and hash and salt all thing automaticaly implement by passport-local-mongoose package
});


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);