"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ theme, ...props }: ToasterProps) => {
   return (
      <Sonner
         theme={theme as ToasterProps["theme"]}
         className="toaster group"
         toastOptions={{
            classNames: {
               toast: "group toast bg-card text-card-foreground border border-border shadow-lg",
               description: "text-muted-foreground",
               actionButton: "bg-primary text-primary-foreground hover:opacity-90",
               cancelButton: "bg-muted text-muted-foreground",
            },
         }}
         {...props}
      />
   )
}

export { Toaster }
