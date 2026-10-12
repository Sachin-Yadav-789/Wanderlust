const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isowner, validateListing} = require("../middleware.js");
const  listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });//here multer save file  by default in  cloudinary storage




 //here for more compact i use here (router.route) using this i stop router path repition. 

  router
  .route("/")
   //index route
  .get(wrapAsync(listingController.index))
   //create route
  .post(
      isLoggedIn,
      validateListing,
      upload.single("listing[image]"),
      wrapAsync(listingController.createListing)
   ); 

   
  //New route
   router.get("/new", isLoggedIn, listingController.renderNewForm);


   router.route("/:id")
           // show route
          .get(wrapAsync( listingController.showListing))
          //update route
                .put(
               isLoggedIn,
               isowner,
               upload.single("listing[image]"), 
               validateListing,
              wrapAsync(listingController.updateListing)
     )
       // delete route
       .delete(
               isLoggedIn,
               isowner,
               wrapAsync(listingController.destroyListing)
); 

   //edit route
   router.get("/:id/edit",
            isLoggedIn,
            isowner,
            wrapAsync(listingController.renderEditForm)
); 


module.exports = router;