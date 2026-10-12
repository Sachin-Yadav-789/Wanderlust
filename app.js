if(process.env.NODE_ENV != "production"){ // this is only for development phase.
   require('dotenv').config();
}
const express  = require("express");
const app = express();
const port = 3000;
const mongoose  = require("mongoose");
const ejsMate = require("ejs-mate");
const  session = require("express-session");
const { MongoStore } = require('connect-mongo');
const  flash   = require("connect-flash");
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const listingRoute =  require("./routes/listing.js");
const  reviewRoute =  require("./routes/reviews.js");
const  userRoute =  require("./routes/user.js");

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set("view engine","ejs");
const path = require("path");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine('ejs', ejsMate);

app.use(express.static (path.join(__dirname,"public")));


  const dbUrl = process.env.ATLASDB_URL;

   main()
     .then( () =>{
        console.log("connection succesfuly to db");
     })
     .catch( (err) =>{
        console.log(err);
     })
   
    async function main() {
               await mongoose.connect(dbUrl);
       }
    

  const store =  MongoStore.create({
     mongoUrl : dbUrl,
     crypto:{
      secret: process.env.SECRET,
     },
     touchAfter : 24 * 3600, //seconds
  });
   
   store.on("error", (err) =>{
     console.log("ERROR in MONGO SESSION STORE",err);
   });
   

 const sessionOptions = {
        store,
        secret :  process.env.SECRET,
        resave : false,
        saveUninitialized : true,
        cookie : {
           expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // in 7 days  milesecond is this(7 * 24 * 60 * 60 * 1000)
           maxAge : 7 * 24 * 60 * 60 * 1000,
           httpOnly  : true,
      },
  };


 app.use(session(sessionOptions));
  app.use(flash());
  
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));// authenticate->login and  signUp

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


 //define middleware for flash
   app.use(( req , res , next) =>{
       res.locals.success = req.flash("success"); // here success is an array
       res.locals.error = req.flash("error"); // here error is an array
       res.locals.currUser = req.user;
        next();
   });


// listing route
   app.use("/listings",listingRoute);//  /listings  => parent route
//review route
    app.use("/listings/:id/reviews",reviewRoute); //   /listings/:id/reviews => parent route

//user route
  app.use('/',userRoute);


// Catch-all for unmatched routes
      app.use((req, res, next) => {
      next(new ExpressError(404, "Page not found"));
      });

    //Error handling Middleware
   app.use((err,req,res,next) =>{
      let{status = 500,message = "Something went wrong"} = err; // deconstruct of (ExpressError)
      // res.status(status).send(message);
      res.status(status).render("listings/error.ejs",{message,status});
   })

app.listen(port,()=>{
    console.log(`listening port : ${port}`);
 })