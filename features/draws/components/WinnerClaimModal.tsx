"use client"

import { useState, useCallback, useEffect } from "react"
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useClaimPrize } from "../hooks/useDrawParticipation"
import { apiClient } from "@/lib/supabase/client"
import { IconUpload, IconPhoto, IconCheck } from "@tabler/icons-react"

interface WinnerClaimModalProps {
   open: boolean
   onOpenChange: (open: boolean) => void
   drawResult: {
      id: string
      position: number
      prize_amount: number
      draws?: { month: number; year: number }
   } | null
}

const MONTHS = [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December",
]

export function WinnerClaimModal({ open, onOpenChange, drawResult }: WinnerClaimModalProps) {
   const claimMutation = useClaimPrize()
   const [proofUrl, setProofUrl] = useState("")
   const [photoUrl, setPhotoUrl] = useState("")
   const [proofFile, setProofFile] = useState<File | null>(null)
   const [photoFile, setPhotoFile] = useState<File | null>(null)
   const [proofPreview, setProofPreview] = useState<string>("")
   const [photoPreview, setPhotoPreview] = useState<string>("")
   const [uploading, setUploading] = useState(false)
   const [submitted, setSubmitted] = useState(false)
   const [activeField, setActiveField] = useState<"proof" | "photo" | null>(null)

   const uploadFile = async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "winner-proofs")

      const response = await fetch("/api/upload", {
         method: "POST",
         body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
         throw new Error(data.error || "Upload failed")
      }

      return data.publicUrl
   }

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "proof" | "photo") => {
      const file = e.target.files?.[0]
      if (!file) return

      if (type === "proof") {
         setProofFile(file)
         setProofPreview(URL.createObjectURL(file))
      } else {
         setPhotoFile(file)
         setPhotoPreview(URL.createObjectURL(file))
      }
   }

   useEffect(() => {
      if (!open) return

      const handlePaste = (e: ClipboardEvent) => {
         const items = e.clipboardData?.items
         if (!items || !activeField) return

         for (const item of items) {
            if (item.type.startsWith("image/")) {
               const file = item.getAsFile()
               if (!file) continue

               if (activeField === "proof") {
                  setProofFile(file)
                  setProofPreview(URL.createObjectURL(file))
               } else {
                  setPhotoFile(file)
                  setPhotoPreview(URL.createObjectURL(file))
               }
               break
            }
         }
      }

      document.addEventListener("paste", handlePaste)
      return () => document.removeEventListener("paste", handlePaste)
   }, [open, activeField])

   const handleSubmit = async () => {
      if (!drawResult) return

      setUploading(true)
      try {
         let finalProofUrl = proofUrl
         let finalPhotoUrl = photoUrl

         if (proofFile) {
            finalProofUrl = await uploadFile(proofFile)
         }
         if (photoFile) {
            finalPhotoUrl = await uploadFile(photoFile)
         }

         await claimMutation.mutateAsync({
            drawResultId: drawResult.id,
            proof_screenshot_url: finalProofUrl,
            winner_photo_url: finalPhotoUrl,
         })
         setSubmitted(true)
      } catch (err) {
         console.error("Failed to submit claim:", err)
      }
      setUploading(false)
   }

   if (!drawResult) return null

   const monthName = MONTHS[(drawResult.draws?.month || 1) - 1]
   const positionSuffix = getOrdinalSuffix(drawResult.position)

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-lg">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <IconCheck className="w-6 h-6 text-green-500" />
                  Congratulations! You Won {positionSuffix} Place!
               </DialogTitle>
               <DialogDescription>
                  {monthName} {drawResult.draws?.year} draw - Prize: ₹
                  {Number(drawResult.prize_amount || 0).toLocaleString()}
               </DialogDescription>
            </DialogHeader>

            {submitted ? (
               <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                     <IconCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                     <p className="font-semibold text-lg">Submission Received!</p>
                     <p className="text-sm text-muted-foreground mt-1">
                        We&apos;re verifying your submission. You&apos;ll be notified once approved.
                     </p>
                  </div>
                  <Button onClick={() => onOpenChange(false)} className="w-full">
                     Done
                  </Button>
               </div>
            ) : (
               <div className="space-y-6 py-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                     <div className="flex justify-between items-center">
                        <span className="font-medium">Prize Amount</span>
                        <span className="text-2xl font-bold text-accent">
                           ₹{Number(drawResult.prize_amount || 0).toLocaleString()}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <ImageUploadField
                        label="Golf Score Screenshot"
                        placeholder="Paste URL or upload screenshot"
                        value={proofUrl}
                        onChange={setProofUrl}
                        onFileChange={e => handleFileChange(e, "proof")}
                        onFocus={() => setActiveField("proof")}
                        onBlur={() => setActiveField(null)}
                        preview={proofPreview}
                        icon={IconPhoto}
                     />

                     <ImageUploadField
                        label="Photo with Golf Clubs"
                        placeholder="Paste URL or upload your photo"
                        value={photoUrl}
                        onChange={setPhotoUrl}
                        onFileChange={e => handleFileChange(e, "photo")}
                        onFocus={() => setActiveField("photo")}
                        onBlur={() => setActiveField(null)}
                        preview={photoPreview}
                        icon={IconPhoto}
                     />
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                     Tip: Click inside any field and press Ctrl+V to paste an image
                  </div>

                  <div className="flex gap-3 pt-2">
                     <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                     >
                        Cancel
                     </Button>
                     <Button
                        className="flex-1 bg-accent hover:bg-accent/90"
                        onClick={handleSubmit}
                        disabled={
                           uploading || (!proofUrl && !proofFile) || (!photoUrl && !photoFile)
                        }
                     >
                        {uploading ? "Uploading..." : "Submit for Verification"}
                     </Button>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   )
}

function ImageUploadField({
   label,
   placeholder,
   value,
   onChange,
   onFileChange,
   onFocus,
   onBlur,
   preview,
   icon: Icon,
}: {
   label: string
   placeholder: string
   value: string
   onChange: (v: string) => void
   onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
   onFocus?: () => void
   onBlur?: () => void
   preview: string
   icon: any
}) {
   return (
      <div>
         <label className="text-sm font-medium mb-2 block">{label}</label>
         <div className="flex gap-2">
            <Input
               placeholder={placeholder}
               value={value}
               onChange={e => onChange(e.target.value)}
               onFocus={onFocus}
               onBlur={onBlur}
               className="flex-1"
            />
            <label className="cursor-pointer px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
               <IconUpload className="w-5 h-5" />
               <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
         </div>
         {preview && (
            <img
               src={preview}
               alt="Preview"
               className="mt-2 w-full h-32 object-cover rounded-lg border"
            />
         )}
      </div>
   )
}

function getOrdinalSuffix(n: number): string {
   const s = ["th", "st", "nd", "rd"]
   const v = n % 100
   return s[(v - 20) % 10] || s[v] || s[0]
}
