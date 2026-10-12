const Listing = require("../models/listing.js")
const ExpressError = require("../utils/ExpressError.js");
const listingCategories = require("../utils/listingCategories.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const getListingGeometry = async (location, country) => {
      const response = await geocodingClient
         .forwardGeocode({
            query: `${location}, ${country}`,
            limit: 1,
         })
         .send();

      const feature = response.body.features[0];
      if (!feature) {
         throw new ExpressError(422, "We couldn't find that location. Please enter a more specific location and country.");
      }
      return feature.geometry;
};


module.exports.index =  async(req,res) =>{
          const { search = "", category = "" } = req.query;
          if (typeof search !== "string" || typeof category !== "string") {
             throw new ExpressError(400, "Search and category filters must be single values.");
          }
          if (search.length > 100) {
             throw new ExpressError(400, "Search must be 100 characters or fewer.");
          }
          if (category && !listingCategories.includes(category)) {
             throw new ExpressError(400, "Invalid listing category.");
          }

          const query = {};
          const trimmedSearch = search.trim();
          if (trimmedSearch) {
             const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
             const searchRegex = new RegExp(escapedSearch, "i");
             query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { country: searchRegex },
             ];
          }
          if (category) {
             query.category = category;
          }

          const AllListings  = await Listing.find(query);
          res.render("./listings/index.ejs", {
             AllListings,
             search: trimmedSearch,
             category,
             listingCategories,
          });
   };

module.exports.renderNewForm = (req,res) =>{
      res.render("listings/new.ejs", { listingCategories });
   }

module.exports.showListing = async(req,res)=>{
      let{id} = req.params;
      const listing = await Listing.findById(id)
          .populate({
               path : "reviews",
               populate :{
               path : "author",
               },
          })
         .populate("owner");
      if(!listing){
        req.flash("error","Listing You requested for does not exist!"); 
      return res.redirect("/listings");
     }
      res.render("listings/show.ejs",{listing});
 }   

 module.exports.createListing = async(req,res,next) => {
        const { location, country } = req.body.listing;
        const geometry = await getListingGeometry(location, country);
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing =   new Listing(req.body.listing);
         newListing.owner = req.user._id;
         newListing.image = { url , filename };
         newListing.geometry = geometry;
       let savedListing =   await newListing.save();
         console.log(savedListing);
         req.flash("success","New Listing  Created!");
         res.redirect("/listings");
         }

   module.exports.renderEditForm = async(req,res) =>{
            let{id} = req.params;
            const listing = await Listing.findById(id);
            if(!listing){
               req.flash("error","Listing You requested for does not exist!"); 
               return res.redirect("/listings");
            }
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace(
           "/upload/",
           "/upload/c_fill,w_250,h_300/"
         ); 
        res.render("listings/edit.ejs",{
          listing,
          originalImageUrl,
          listingCategories,
        });
  }

  module.exports.updateListing = async(req,res)=>{
      let { id } = req.params;
     let listing = await Listing.findById(id);
     if (!listing) {
        req.flash("error","Listing You requested for does not exist!");
        return res.redirect("/listings");
     }

     const { location, country } = req.body.listing;
     if (listing.location !== location || listing.country !== country) {
        listing.geometry = await getListingGeometry(location, country);
     }
     Object.assign(listing, req.body.listing);
         
      if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url , filename };
   }
       await listing.save();
        req.flash("success"," Listing  Updated!");
         res.redirect(`/listings/${id}`);// means redirect at "show route" after submitings to show changes.
   } 

    module.exports.destroyListing = async(req,res) =>{
               let{id} = req.params;
               const deleteListing = await Listing.findByIdAndDelete(id);
               console.log(deleteListing);
               req.flash("success"," Listing  deleted!");
               res.redirect("/listings");
         }