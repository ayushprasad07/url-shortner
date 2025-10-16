import dbConnect from "@/lib/dbConnect";
import URL from "@/models/URL";
import { nanoid } from "nanoid";

// /api/create-stdid

export async function POST(req:Request){
    dbConnect();

    try {
        const {originalUrl} = await req.json();

        const existingUrl = await URL.findOne({originalUrl});
        if(existingUrl){
            return Response.json({
                success:true,
                data:existingUrl
            })
        }

        const stdid = nanoid(6);

        const url = new URL({
            stdId:stdid,
            originalUrl
        })

        const savedUrl = await url.save();
        return Response.json({
            success:true,
            data:savedUrl
        },{status:200})

    } catch (error) {
        console.log("Error while creating stdid : ",error);
        return Response.json({
            success:false,
            message:"Error while creating stdid"
        },{status:500})
    }
}