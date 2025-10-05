import jwt from "jsonwebtoken"
import User from "../models/User.js"
import "dotenv/config"


const protectRoute=async( req,res,next )=>{
    try {
        
        //get token
        const token=req.header("Authorization").replace("Bearer ","");
        if(!token) return res.status(401).json({message:"No authorization token, access denied"});

        //verify token
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //find user
        const user=await User.findById(decoded.userId).select("-password");   //select every field except password
        if(!user) return res.status(401).json({message:"token is not valid"});

        req.user=user;
        next();


    } catch (error) {
        console.error("Authorization Error:",error.message);
        res.status(401).json({message:" Token is not valid "})
    }
  
}
export default protectRoute