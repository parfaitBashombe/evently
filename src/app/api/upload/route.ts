import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";

export const POST = async (request: NextRequest) => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const privateKey = process.env.IMAGE_KIT_SECRET;
  const publicKey = process.env.IMAGE_KIT_PUBLIC;

  if (!privateKey || !publicKey) {
    return NextResponse.json(
      { error: "ImageKit not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/evently";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("fileName", file.name || `upload-${Date.now()}`);
    uploadForm.append("folder", folder);
    uploadForm.append("useUniqueFileName", "true");

    const credentials = Buffer.from(`${privateKey}:`).toString("base64");

    const response = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}` },
        body: uploadForm,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ImageKit upload failed", err);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url, fileId: data.fileId });
  } catch (error) {
    console.error("Upload error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
