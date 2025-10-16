import dbConnect from "@/lib/dbConnect";
import URL from "@/models/URL";

// /api/redirect/[stdid]

export async function GET(req:Request,{params}: {params : Promise<{stdid:string}>}){
    dbConnect();

    try {
        const {stdid}  = await params;

        const redirectUrl = await URL.findOne({stdId:stdid});

        if(redirectUrl){
            return Response.redirect(redirectUrl.originalUrl);
        }

        return Response.json({
            success:false,
            message:"No url found"
        },{
            status:404
        })
    } catch (error) {
        console.log("Error while creating stdid : ",error);
        return Response.json({
            success:false,
            message:"Error while creating stdid"
        },{
            status:500
        })
    }
}