const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../util/wrapAsync");
const passport = require("passport");
const{saveredirecturl}=require("../middleware.js");
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, password, email } = req.body;
      const newuser = new User({ email, username });
      const registered = await User.register(newuser, password);
      req.login(registered,(err)=>{
        if(err){return next(err)}
      req.flash("success", "Welcome!!");
      res.redirect("/listings");
      })
      
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});
router.post(
  "/login",saveredirecturl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success","Welcome to Wanderlust");
    let redirecturl=res.locals.redirectUrl || "/listings";
    res.redirect(redirecturl);
  }
);
router.get('/logout',(req,res,next)=>{
  req.logout((err)=>{
    if(err){return next(err);}
    req.flash("success","you are logged out");
    res.redirect("/listings");
  })
})
module.exports = router;
