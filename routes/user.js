const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/user.js");


//router.route() , Expressjs.com

 router.route("/signup")
        //sign up
        .get(userController.signupForm)
        .post( wrapAsync(userController.signup)); 


  router.route("/login")
     //login  
     .get(userController.loginForm)
     .post(
       saveRedirectUrl,
       passport.authenticate("local",{
         failureRedirect: "/login",
         failureFlash : true,
        }),
       userController.login
     ); 



  //log-out
   router.get("/logout",userController.logout);
    


module.exports = router;