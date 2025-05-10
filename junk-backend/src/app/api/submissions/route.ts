import { NextResponse } from "next/server";
import { submissionsTable } from "@/lib/airtable";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset") || 0;
  if (typeof offset !== "number") {
    return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  }

  const status = searchParams.get("status") || "Approved";
  if (!["Approved", "Pending", "Rejected", "Needs Changes"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // const features = searchParams.get('features') || "any";

  const query = await submissionsTable
    .select({
      fields: ["Code URL", "First Name", "Last Name", "Screenshot", "Status"],
      pageSize: 6,
      offset: offset,
      filterByFormula: `{Status} = "${status}"`,
    })
    .firstPage();
  const submissions = query.map((record) => {
    const screenshots = record.get("Screenshot");
    const screenshotUrl =
      screenshots && Array.isArray(screenshots) && screenshots.length > 0
        ? screenshots[0].url
        : "";

    return {
      id: record.id,
      codeUrl: record.get("Code URL"),
      firstName: record.get("First Name"),
      lastName: record.get("Last Name"),
      screenshot: screenshotUrl,
      status: record.get("Status"),
    };
  });

  return NextResponse.json({ submissions });
}
