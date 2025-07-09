
// console.log(process.env.SECRET);
const express=require("express");
const app=express();
const mongoose=require("mongoose");
// const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
// const wrapAsync = require("./util/wrapAsync.js");
// const ExpressError=require("./util/ExpressError.js");
// const {listingSchema , reviewSchema}=require("./schema.js");
// const Review=require("./models/review.js");
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
// const validateListing=(req,res,next)=>{
//     let{error}=listingSchema.validate(req.body);
    
//     if(error){
//         throw new ExpressError(400,error);
//     }else{
//         next();
//     }
// };
// const validateReview=(req,res,next)=>{
//     let{error}=reviewSchema.validate(req.body);
    
//     if(error){
//         throw new ExpressError(400,error);
//     }else{
//         next();
//     }
// }
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
// app.get("/listings",wrapAsync(async (req,res)=>{
//    const alllistings=await  Listing.find({});
//    res.render("listings/index.ejs",{alllistings});
// }));
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// });
// app.get("/listings/:id", wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
// }));
// app.post("/listings",async(req,res,next)=>{
//     try{
//     let result=listingSchema.validate(req.body);
//     console.log(result);
//     if(result.error){
//         throw new ExpressError(400,result.error);
//     }
//     const listingData = req.body.listing;

//     // Check if image is missing or empty and assign a default
//     if (!listingData.image || listingData.image.trim() === "") {
//         listingData.image = "https://images.unsplash.com/photo-1603477849227-705c424d1d80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJvcGljYWwlMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D"; // Change path if needed
//     }

//     const newListing = new Listing(listingData);

//     await newListing.save();
//     res.redirect("/listings");}catch(err){
//         next(err);
//     }
//     // let newlisting=new Listing(req.body.listing);

//     // await newlisting.save();
//     // res.redirect("/listings");
// });
// app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     const listing =await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));
// app.put("/listings/:id", validateListing,wrapAsync(async(req,res)=>{
//     let {id}=req.params;
//    await Listing.findByIdAndUpdate(id,{...req.body.listing},{ new: true, runValidators: true });
//    res.redirect(`/listings/${id}`);
// }));
// app.delete("/listings/:id", wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let deleted=await Listing.findByIdAndDelete(id);
//     console.log("deleted");
//     res.redirect("/listings");
// }));
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
// app.post("/listings/:id/reviews" ,validateReview,wrapAsync(async(req,res)=>{
//    let listing=await Listing.findById(req.params.id);
//    let newReview=new Review(req.body.review);
//    listing.reviews.push(newReview);
//    await newReview.save();
//    await listing.save();
//    res.redirect(`/listings/${listing._id}`);
// }));
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let{id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));
// app.get("/test",async (req,res)=>{
//     let sample=new Listing({
//         title:"My new villa",
//         description:"by the beach",
//         price:1200,
//         location:"Goa",
//         country:"India",
//     });
//     await sample.save();
//     res.send("successful");
// });
// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"page not found"));
// });
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