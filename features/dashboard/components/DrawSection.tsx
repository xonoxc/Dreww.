"use client"

interface DrawPrize {
   position: string
   prize: string
   distribution: string
}

export function DrawSection() {
   const prizes: DrawPrize[] = [
      { position: "1st Place", prize: "$500", distribution: "40%" },
      { position: "2nd Place", prize: "$350", distribution: "35%" },
      { position: "3rd Place", prize: "$250", distribution: "25%" },
   ]

   const nextDrawDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()

   return (
      <div className="mt-12 p-8 border border-border rounded-lg bg-secondary/20">
         <h2 className="text-2xl font-heavy text-foreground mb-4">This Month&apos;s Draw</h2>
         <div className="grid md:grid-cols-3 gap-6">
            {prizes.map((draw, i) => (
               <div
                  key={i}
                  className="p-6 border border-border rounded-lg bg-card hover:border-accent smooth-transition"
               >
                  <p className="text-sm text-muted-foreground font-normal-weight mb-2">
                     {draw.position}
                  </p>
                  <p className="text-3xl font-heavy text-accent mb-2">{draw.prize}</p>
                  <p className="text-xs text-muted-foreground font-normal-weight">
                     {draw.distribution} of pool
                  </p>
               </div>
            ))}
         </div>

         <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm font-normal-weight text-foreground">
               <span className="font-heavy">Next draw closes:</span> {nextDrawDate}
            </p>
            <p className="text-xs text-muted-foreground font-normal-weight mt-2">
               You&apos;re automatically eligible with your submitted scores. Keep playing to
               improve your chances!
            </p>
         </div>
      </div>
   )
}
