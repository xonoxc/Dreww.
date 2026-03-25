"use client"

import { useState } from "react"
import { golfScoreSchema } from "@/lib/schemas/golf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddScoreFormProps {
   onSubmit: (data: any) => Promise<void>
   loading?: boolean
}

export const AddScoreForm = ({ onSubmit, loading = false }: AddScoreFormProps) => {
   const [formData, setFormData] = useState({
      stableforfScore: "",
      courseName: "",
      coursePar: "",
      scoreDate: new Date().toISOString().split("T")[0],
      notes: "",
   })

   const [errors, setErrors] = useState<Record<string, string>>({})
   const [isSubmitting, setIsSubmitting] = useState(false)

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
         ...prev,
         [name]: value,
      }))
      if (errors[name]) {
         setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[name]
            return newErrors
         })
      }
   }

   const handleSubmit = async (e: React.SubmitEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setErrors({})

      const validatedationRes = golfScoreSchema.safeParse({
         stableforfScore: parseInt(formData.stableforfScore),
         courseName: formData.courseName,
         coursePar: formData.coursePar ? parseInt(formData.coursePar) : undefined,
         scoreDate: formData.scoreDate,
         notes: formData.notes || undefined,
      })

      if (!validatedationRes.success) {
         setIsSubmitting(false)
         setErrors(validatedationRes.error.flatten().fieldErrors as Record<string, string>)
         return
      }

      const validated = validatedationRes.data

      await onSubmit({
         course_name: validated.courseName,
         stableford_score: validated.stableforfScore,
         score_date: validated.scoreDate.toISOString(),
         course_par: validated.coursePar,
         notes: validated.notes,
      })

      setFormData({
         stableforfScore: "",
         courseName: "",
         coursePar: "",
         scoreDate: new Date().toISOString().split("T")[0],
         notes: "",
      })
      setIsSubmitting(false)
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 p-6 border border-border rounded-lg bg-secondary/20"
      >
         <h3 className="text-lg font-heavy text-foreground">Log New Score</h3>

         <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-sm font-heavy">Stableford Score</label>
               <Input
                  type="number"
                  name="stableforfScore"
                  placeholder="0-45"
                  value={formData.stableforfScore}
                  onChange={handleChange}
                  disabled={loading || isSubmitting}
                  className="bg-card border-border text-foreground"
                  min="0"
                  max="45"
               />
               {errors.stableforfScore && (
                  <p className="text-xs text-destructive">{errors.stableforfScore}</p>
               )}
            </div>

            <div className="space-y-2">
               <label className="text-sm font-heavy">Course Name</label>
               <Input
                  type="text"
                  name="courseName"
                  placeholder="e.g., Pebble Beach"
                  value={formData.courseName}
                  onChange={handleChange}
                  disabled={loading || isSubmitting}
                  className="bg-card border-border text-foreground"
               />
               {errors.courseName && (
                  <p className="text-xs text-destructive">{errors.courseName}</p>
               )}
            </div>

            <div className="space-y-2">
               <label className="text-sm font-heavy">Course Par</label>
               <Input
                  type="number"
                  name="coursePar"
                  placeholder="36-72"
                  value={formData.coursePar}
                  onChange={handleChange}
                  disabled={loading || isSubmitting}
                  className="bg-card border-border text-foreground"
                  min="9"
                  max="73"
               />
               {errors.coursePar && <p className="text-xs text-destructive">{errors.coursePar}</p>}
            </div>

            <div className="space-y-2">
               <label className="text-sm font-heavy">Score Date</label>
               <Input
                  type="date"
                  name="scoreDate"
                  value={formData.scoreDate}
                  onChange={handleChange}
                  disabled={loading || isSubmitting}
                  className="bg-card border-border text-foreground"
               />
               {errors.scoreDate && <p className="text-xs text-destructive">{errors.scoreDate}</p>}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-heavy">Notes</label>
            <textarea
               name="notes"
               placeholder="Any notes about your round..."
               value={formData.notes}
               onChange={handleChange}
               disabled={loading || isSubmitting}
               className="w-full h-20 bg-card border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground text-sm"
            />
         </div>

         <Button
            type="submit"
            disabled={loading || isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-heavy button-hover"
         >
            {isSubmitting ? "Adding Score..." : "Add Score"}
         </Button>
      </form>
   )
}
