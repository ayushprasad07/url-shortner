import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import URL from "@/models/URL";

// /api/get-links

export async function GET(req: Request) {
  await dbConnect(); 

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
    const urls = await URL.find({ userId });

    if (urls.length === 0) {
      return Response.json(
        { success: false, message: "No links found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, data: urls },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while fetching links:", error);
    return Response.json(
      { success: false, message: "Error while fetching links" },
      { status: 500 }
    );
  }
}
