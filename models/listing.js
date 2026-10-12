const mongoose = require("mongoose");
const Review = require("./reviews.js");
const listingCategories = require("../utils/listingCategories.js");


const Schema = mongoose.Schema;

const listingSchema  = new  Schema ({
   title :{
       type : String,
       required : true,
   }, 
   description : {
      type : String,
       },
    
   image:{ 
   url : String,
   filename: String,
  },

  price : {
       type : Number,
     },
   location : {
       type : String,
   
   }, 
   country : {
    type : String,
    }, 
   category : {
    type : String,
    enum : [...listingCategories, ""],
   },
   reviews : [{
    type : Schema.Types.ObjectId,
    ref : "Review",
   }] ,

   owner : {
      type : Schema.Types.ObjectId,
      ref : "User",
   },

   geometry : {
      type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
  });

  // using this when we delete listing so also automatic delete  that perticulat list all reveiws delete from database.
  listingSchema.post("findOneAndDelete",async (listing) =>{/*Mongoose post middleware (hook) ,It runs after a Listing.findOneAndDelete() operation.
Mongoose automatically passes the deleted document into the callback (here named listing).*/
   if(listing){
       await Review.deleteMany({_id: {$in : listing.reviews}});
     }
  });

  const Listing = mongoose.model("Listing",listingSchema);

  module.exports = Listing;