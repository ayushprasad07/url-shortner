import dbConnect from "@/lib/dbConnect";
import URL from "@/models/URL";
import { nanoid } from "nanoid";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";


// /api/create-stdid

export async function POST(req:Request){


    dbConnect();

    const session = await getServerSession(authOptions);
    const user : User = session?.user as User;

    if(!session || !session.user){
        return Response.json({
            success:false,
            message:"Unauthorized"
        },{status:401})
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const {originalUrl,expiresAt} = await req.json();

        const existingUrl = await URL.findOne({originalUrl});
        if(existingUrl){
            return Response.json({
                success:true,
                data:existingUrl
            })
        }

        const stdid = nanoid(6);

        const url = await  URL.create({
            stdId:stdid,
            originalUrl,
            userId:userId,
            isActive:true,
            expiresAt:expiresAt
        })

        return Response.json({
            success:true,
            data:url,
        },{status:200})

    } catch (error) {
        console.log("Error while creating stdid : ",error);
        return Response.json({
            success:false,
            message:"Error while creating stdid"
        },{status:500})
    }
}