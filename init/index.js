const mongoose=require("mongoose");
const initData=require("./data1.js");
const Listing=require("../models/listing.js");
main().then(()=>{
    console.log("connected successfully");
}).catch(err=>{console.log(err);})
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68132a66b1338752d89a06da"}));
    await Listing.insertMany(initData.data);
    console.log("data was saved");
}
initDB();