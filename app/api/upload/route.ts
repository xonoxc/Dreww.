import { createAdminClient } from "@/lib/supabase/server"
import { fromPromise } from "neverthrow"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
   const supabase = createAdminClient()

   const formData = await request.formData()
   const file = formData.get("file") as File
   const folder = (formData.get("folder") as string) || "winner-proofs"

   if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
   }

   const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

   const uploadRes = await fromPromise(
      supabase.storage.from("winner-proofs").upload(fileName, file),
      err => err
   )

   if (uploadRes.isErr()) {
      console.error("Upload error:", uploadRes.error)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
   }

   const { data: urlData } = supabase.storage.from("winner-proofs").getPublicUrl(fileName)

   return NextResponse.json({
      path: fileName,
      publicUrl: urlData.publicUrl,
   })
}
