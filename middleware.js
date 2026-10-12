const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req,res,next) =>{
  // console.log(req.path, "..", req.originalUrl);   
  if(!req.isAuthenticated()){
         req.session.redirectUrl = req.originalUrl;
         req.flash("error","you must be logged in!");
         return res.redirect("/login");
      }
      next();
    };

 module.exports.saveRedirectUrl = (req,res,next) =>{
        if(req.session.redirectUrl){
          res.locals.redirectUrl = req.session.redirectUrl;
        }
       next(); 
    };

    //check before update, only owner have acess to edit
    module.exports.isowner = async(req,res,next) =>{
        let{id} = req.params;
         let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
          req.flash("error","You are not owner");
          return res.redirect(`/listings/${id}`);
        }   
        next();
    };

   // Validation  for listing Schema
    module.exports.validateListing = (req,res,next) =>{
          let{error} = listingSchema.validate(req.body); // validate is a "joi" method->it returns an "value" or ("error"->if data does not match with the schema"). 
          if(error){
             let errMsg = error.details.map((el) =>el.message).join(",");
             throw new ExpressError(400,errMsg);
          }else{
             next();
          }
        };

   //validation for review Schema
   module.exports.validateReview = (req,res,next) =>{
      let{error} = reviewSchema.validate(req.body); // validate is a "joi" method->it returns an "value" or ("error"->if data does not match with the schema"). 
      if(error){
         let errMsg = error.details.map((el) =>el.message).join(",");
         throw new ExpressError(400,errMsg);
      }else{
         next();
      }
   };     

   //for review deleting only author can delete
    module.exports.isReviewAuthor = async(req,res,next) =>{
        let{id,reviewId} = req.params;
         let review = await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id)){
          req.flash("error","You are not author of this review");
          return res.redirect(`/listings/${id}`);
        }   
        next();
    };