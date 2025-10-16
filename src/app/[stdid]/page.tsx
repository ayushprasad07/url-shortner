import dbConnect from "@/lib/dbConnect";
import URL from "@/models/URL";
import { redirect } from "next/navigation";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ stdid: string }>;
}) {
  await dbConnect();

  const { stdid } = await params; 

  const redirectUrl = await URL.findOne({ stdId: stdid }); 

  if (redirectUrl && redirectUrl.originalUrl) {
    redirect(redirectUrl.originalUrl);
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>404 — URL not found</h2>
    </div>
  );
}
