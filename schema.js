 //for validation from server side.
 
 //lisitng validation
 const joi = require("joi");
 const listingCategories = require("./utils/listingCategories.js");

 module.exports.listingSchema = joi.object({
     listing : joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location:joi.string().required(),
        country:joi.string().required(),
         price:joi.number().required().min(0),
        category:joi.string().valid(...listingCategories).allow(""),
        image:joi.string().allow("",null),  
     }).required(),
 });

 // for reviews validation
 module.exports.reviewSchema = joi.object({
    review : joi.object({
       rating : joi.number().required().min(1).max(5),
       comment : joi.string().required(),
     }).required(),
 });