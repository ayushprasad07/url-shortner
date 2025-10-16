import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import URL from "@/models/URL";

// PUT /api/change-activity/[urlid]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ urlid : string }> }
) {
  await dbConnect();

  const { urlid } = await params; 
  console.log("urlid", urlid);

  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const urlId = new mongoose.Types.ObjectId(urlid);
    console.log("urlId", urlId);

    const url = await URL.findOne({ _id: urlId, userId });
    if (!url) {
      console.log("URL not found or unauthorized");
      return Response.json(
        { success: false, message: "URL not found or unauthorized" },
        { status: 404 }
      );
    }

    url.isActive = !url.isActive;
    await url.save();

    return Response.json(
      {
        success: true,
        message: "Activity status updated successfully",
        data: url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while changing activity:", error);
    return Response.json(
      { success: false, message: "Error while changing activity" },
      { status: 500 }
    );
  }
}
