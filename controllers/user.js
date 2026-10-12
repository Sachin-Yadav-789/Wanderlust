const User =  require("../models/user");

module.exports.signupForm = (req,res) =>{
     res.render("users/signup.ejs");     
}

module.exports.signup = async(req,res,next) =>{
   try{
         let{username, email,password} = req.body;
         const newUser = new User({username,email});
         const registeredUser = await User.register(newUser , password);
         console.log(registeredUser);
         req.login(registeredUser,(err) =>{ // this is for when user sign-up so autimatically user log-in.
             if(err) {
                return next(err);
             }
             req.flash("success","Welcome to Wanderlust!");
             res.redirect("/listings");
           });
        }catch(e){
       req.flash("error",e.message);
       res.redirect("/signup");
   }
}

module.exports.loginForm = (req,res) =>{
      res.render("users/login.ejs")
   }

module.exports.login =  async(req,res) =>{
       req.flash("success","Welcome back to Wanderlust");
       let redirectUrl =  res.locals.redirectUrl || "/listings"; // if res.locals.redirectUrl this  have redirect url so this save unless you save "/listings"
       res.redirect(redirectUrl);
    }

module.exports.logout = (req,res,next) =>{
       req.logOut((err) =>{
          if(err) {
             return next(err);
          }
          req.flash("success", "you are logged out!");
          res.redirect("/listings");
       });
   }    