 const express=require("express");
 const router=express.Router();
 const wrapAsync = require("../util/wrapAsync.js");
 const ExpressError=require("../util/ExpressError.js");
 const Listing=require("../models/listing.js");
 const {listingSchema , reviewSchema}=require("../schema.js");
 const{isLoggedIn}=require("../middleware.js");
 const{isOwner}=require("../middleware.js");
 const multer=require('multer');
 const{storage}=require("../cloudconfig.js");
const upload=multer({storage});
 const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
};
router.get("/",wrapAsync(async (req,res)=>{
    const alllistings=await  Listing.find({});
    res.render("listings/index.ejs",{alllistings});
 }));
 router.get("/new",isLoggedIn,(req,res)=>{
    //  if(!req.isAuthenticated()){
    //     req.flash("error","ypu must be logged in to create listing");
    //    return res.redirect("/login");
    //  }
     res.render("listings/new.ejs");
 });
 router.get("/:id", wrapAsync(async(req,res)=>{
     let {id}=req.params;
     const listing =await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
     if(!listing){req.flash("error","Listing does not exist");
        res.redirect("/listings");
     }
     res.render("listings/show.ejs",{listing});
 }));
 router.post("/",isLoggedIn,upload.single("listing[image]"),async(req,res,next)=>{
     try{
     let result=listingSchema.validate(req.body);
     console.log(result);
     if(result.error){
         throw new ExpressError(400,result.error);
     }
     const listingData = req.body.listing;
 
     // Check if image is missing or empty and assign a default
     if (!listingData.image || listingData.image.trim() === "") {
         listingData.image = "https://images.unsplash.com/photo-1603477849227-705c424d1d80?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJvcGljYWwlMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D"; // Change path if needed
     }
    //  let url=req.file.url;
    //  let filename=req.file.filename;
     const newListing = new Listing(listingData);
      newListing.owner=req.user._id;
    //   newListing.image={url,filename}
     await newListing.save();
     req.flash("success","New listing created")
     res.redirect("/listings");}catch(err){
         next(err);
     }
     // let newlisting=new Listing(req.body.listing);
 
     // await newlisting.save();
     // res.redirect("/listings");
 });
 router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
     let {id}=req.params;
     const listing =await Listing.findById(id);
     if(!listing){
        req.flash("error","listing does not exists");
        res.redirect("/listings");
     }
     res.render("listings/edit.ejs",{listing});
 }));
 router.put("/:id", isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
     let {id}=req.params;
    //  let listing=await Listing.findById(id);
    //  if(!listing.owner.equals(res.locals.curUser._id)){
    //     req.flash("error","You do not have permission to edit");
    //     return res.redirect(`/listings/${id}`);
    //  }
    await Listing.findByIdAndUpdate(id,{...req.body.listing},{ new: true, runValidators: true });
    req.flash("success","Listing updated");
    res.redirect(`/listings/${id}`);
 }));
 router.delete("/:id",isLoggedIn, isOwner,wrapAsync(async (req,res)=>{
     let {id}=req.params;
     let deleted=await Listing.findByIdAndDelete(id);
     console.log("deleted");
     req.flash("success","Listing deleted");
     res.redirect("/listings");
 }));
 module.exports=router;
