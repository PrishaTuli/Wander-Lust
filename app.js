
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User = require("./models/user.js");
const userRouter=require("./routes/user.js");
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
main().then(()=>{
    console.log("connected successfully");
}).catch(err=>{console.log(err);})
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*560*1000,
        maxAge:7*24*60*560*1000,
        httpOnly:true,
    }
}
app.get("/",(req,res)=>{
    res.send("i am root");
})
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());//session must be implemented before
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//store user related info in session
passport.deserializeUser(User.deserializeUser());//remove user info from session
render("listings/show.ejs",{listing});

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.curUser=req.user;
    next();
});
app.get("/demouser",async(req,res)=>{
    let fakeuser=new User({
        email:"stu@gmail.com",
        username:"delta"
    })
    let registered= await User.register(fakeuser,"helloworld");//registers unique user in database
    res.send(registered);
})
app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


app.use((err, req, res, next) => {
    // console.error(err.stack);
    let{status=400,message="something wrong"}=err;
    res.render("error.ejs",{message});
    // res.status(status).send(message);
    // res.send("Something broke!");
  });
app.listen(8080,()=>{
    console.log("listening");
})
