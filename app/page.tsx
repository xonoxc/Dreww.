"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/features"

export default function Home() {
   const { user, loading: authLoading } = useAuth()
   const router = useRouter()

   const handlePricingClick = () => {
      if (user) {
         router.push("/subscription")
      } else {
         router.push("/auth/sign-in?redirect=/subscription")
      }
   }
   return (
      <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground font-sans">
         {/* Grid Ambient Background + Noise Overlay */}
         <div
            className="fixed inset-0 grid-ambient pointer-events-none z-0 
			before:absolute before:inset-0 before:opacity-[0.03] before:content-[''] 
			before:bg-[url('https://framerusercontent.com/images/9ErWmXn2IIfOUCaXNwDeuxqJXM.png')] 
			before:bg-repeat"
         />

         {/* Navigation */}
         <nav className="relative z-40 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6">
               <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-accent" />
                  <span className="text-xl font-bold tracking-tighter uppercase">Dreww</span>
               </div>

               <div className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-wider">
                  <a
                     href="#features"
                     className="text-muted-foreground hover:text-foreground smooth-transition"
                  >
                     [ Features ]
                  </a>
                  <a
                     href="#charity"
                     className="text-muted-foreground hover:text-foreground smooth-transition"
                  >
                     [ Impact ]
                  </a>
                  <a
                     href="#draws"
                     className="text-muted-foreground hover:text-foreground smooth-transition"
                  >
                     [ System ]
                  </a>
               </div>

               <div className="flex items-center gap-4">
                  <Link href="/auth/sign-in">
                     <Button
                        variant="ghost"
                        className="font-mono uppercase tracking-wider text-xs rounded-none border border-transparent hover:border-border"
                     >
                        Login
                     </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                     <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono uppercase tracking-wider text-xs rounded-none button-hover">
                        Initialize
                     </Button>
                  </Link>
               </div>
            </div>
         </nav>

         <div
            className={cn(
               "pointer-events-none absolute inset-0 rounded-[inherit] hidden sm:block",
               "bg-[repeating-linear-gradient(180deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.02)_2px,transparent_2px,transparent_4px)]",
               "dark:bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_2px,transparent_4px)]"
            )}
         />

         {/* Hero Section (Rig style: Massive text, stark) */}
         <section className="relative z-10 min-h-[85vh] flex flex-col justify-center px-6 md:px-12 py-24 border-b border-border overflow-hidden">
            <div className="absolute top-0 right-12 w-px h-full bg-border/50 hidden md:block" />
            <div className="absolute top-0 right-64 w-px h-full bg-border/50 hidden lg:block" />

            <div className="max-w-7xl relative z-10">
               <div className="inline-flex items-center gap-3 px-3 py-1 border border-border bg-card/50 backdrop-blur mb-12 fade-in">
                  <span className="w-2 h-2 bg-accent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground px-2">
                     v2.0 Premium Tracking Architecture
                  </span>
               </div>

               <h1 className="text-6xl md:text-[5rem] font-bold leading-[0.9] tracking-tighter text-foreground mb-12 slide-up">
                  Golf meets <br />
                  <span className="text-accent">Charity.</span>
               </h1>

               <div
                  className="grid md:grid-cols-2 gap-12 slide-up"
                  style={{ animationDelay: "100ms" }}
               >
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-xl font-light leading-relaxed">
                     Track your best stableford scores. Compete in algorithmically verified monthly
                     draws. Automatically route your winnings to philanthropic entities.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start gap-6 md:justify-end">
                     <Link href="/auth/sign-up" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest px-10 py-8 text-sm rounded-none button-hover">
                           Execute Setup
                        </Button>
                     </Link>
                     <Link href="#features" className="w-full sm:w-auto">
                        <Button
                           variant="outline"
                           className="w-full sm:w-auto border-border hover:bg-secondary hover:text-foreground font-mono uppercase tracking-widest px-10 py-8 text-sm rounded-none"
                        >
                           View Specs
                        </Button>
                     </Link>
                  </div>
               </div>
            </div>
         </section>

         {/* Status Ticker (Fintech vibe) */}
         <div className="relative z-10 border-b border-border bg-card py-4 overflow-hidden flex whitespace-nowrap">
            <div
               className={cn(
                  "pointer-events-none absolute inset-0 rounded-[inherit] hidden sm:block",
                  "bg-[repeating-linear-gradient(190deg,rgba(0,0,0,0.04)_0px,rgba(0,0,0,0.02)_2px,transparent_2px,transparent_4px)]",
                  "dark:bg-[repeating-linear-gradient(190deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_2px,transparent_4px)]"
               )}
            />
            <div className="animate-marquee flex gap-12 items-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-12 items-center">
                     <span>ACTIVE_NODES: 1,243</span>
                     <span className="w-1 h-1 bg-accent" />
                     <span>TOTAL_VOLUME: $42,500</span>
                     <span className="w-1 h-1 bg-accent" />
                     <span>DRAW_FREQUENCY: 30D</span>
                     <span className="w-1 h-1 bg-accent" />
                     <span>CHARITY_PARTNERS: 54</span>
                     <span className="w-1 h-1 bg-accent" />
                  </div>
               ))}
            </div>
         </div>

         {/* Features Grid (Dashboard Aesthetic) */}
         <section id="features" className="relative z-10 border-b border-border bg-background">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
               {[
                  {
                     code: "MOD_01",
                     title: "Score Telemetry",
                     description:
                        "Direct stableford input. We maintain a secure ledger of your last 5 rounds to calculate moving averages.",
                  },
                  {
                     code: "MOD_02",
                     title: "Algorithmic Draws",
                     description:
                        "Zero human intervention. Smart distribution logic routes 40/35/25% of the pool to top quartile performers.",
                  },
                  {
                     code: "MOD_03",
                     title: "Impact Routing",
                     description:
                        "Automated capital deployment. Pre-select verified entities to receive 10%+ of your gross tournament yields.",
                  },
               ].map((feature, i) => (
                  <div
                     key={i}
                     className="p-10 hover:bg-muted/30 transition-colors group relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-accent" />
                     </div>
                     <div className="flex justify-between items-center mb-12 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                        <span>{feature.title.split(" ")[0]}</span>
                        <span className="text-accent">{feature.code}</span>
                     </div>
                     <h3 className="text-3xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                        {feature.title}.
                     </h3>
                     <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
               ))}
            </div>
         </section>

         {/* Technical Process Section */}
         <section
            id="draws"
            className="relative z-10 py-32 px-6 md:px-12 border-b border-border bg-neutral-800"
         >
            <div className="max-w-7xl mx-auto">
               <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                  <div>
                     <div className="font-mono text-accent text-sm mb-4 uppercase tracking-widest">
                        [ Execution Flow ]
                     </div>
                     <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
                        System Protocols.
                     </h2>
                  </div>
                  <p className="text-muted-foreground max-w-md">
                     A deterministic approach to competitive charity golf. Follow the sequence to
                     initiate your deployment.
                  </p>
               </div>

               <div className="grid md:grid-cols-4 border-t border-l border-border">
                  {[
                     { num: "001", act: "INITIALIZE", desc: "Create secure profile." },
                     { num: "002", act: "INPUT_DATA", desc: "Log verified scorecards." },
                     { num: "003", act: "AWAIT_DRAW", desc: "System locks monthly pool." },
                     { num: "004", act: "DISTRIBUTE", desc: "Yields routed to charities." },
                  ].map((step, i) => (
                     <div
                        key={i}
                        className="border-r border-b border-border p-8 card-hover bg-background relative group"
                     >
                        <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                        <div className="relative z-10">
                           <div className="text-4xl font-mono font-bold text-muted mb-8 group-hover:text-foreground transition-colors">
                              {step.num}
                           </div>
                           <h3 className="text-xl font-bold uppercase tracking-wide mb-2">
                              {step.act}
                           </h3>
                           <p className="text-sm text-muted-foreground font-mono">{step.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Pricing / Access Tiers */}
         <section className="relative z-10 py-32 px-6 md:px-12 bg-background">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-20">
                  <h2 className="text-5xl font-bold tracking-tighter mb-4">Access Tiers.</h2>
                  <div className="w-24 h-1 bg-accent mx-auto" />
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  {[
                     {
                        tier: "BASE",
                        price: "0.00",
                        features: [
                           "Score telemetry log",
                           "Standard draw entry",
                           "5% fixed routing",
                        ],
                        accent: false,
                     },
                     {
                        tier: "PRO_NODE",
                        price: "9.99",
                        features: [
                           "Unrestricted logging",
                           "Priority queue status",
                           "10% dynamic routing",
                           "Advanced analytics output",
                        ],
                        accent: true,
                     },
                     {
                        tier: "ELITE_PROXY",
                        price: "19.99",
                        features: [
                           "All Pro_Node specs",
                           "Private liquidity pools",
                           "15% max routing",
                           "Direct channel support",
                        ],
                        accent: false,
                     },
                  ].map((plan, i) => (
                     <div
                        key={i}
                        className={`p-10 border flex flex-col ${
                           plan.accent
                              ? "border-accent bg-card relative glow-accent"
                              : "border-border bg-neutral-600/10 border-2"
                        }`}
                     >
                        {plan.accent && (
                           <div className="absolute top-0 left-0 w-full bg-accent text-accent-foreground text-center text-xs font-mono font-bold py-1 uppercase tracking-widest">
                              Recommended Spec
                           </div>
                        )}

                        <div
                           className={`mt-4 font-mono text-sm uppercase tracking-widest ${plan.accent ? "text-accent" : "text-muted-foreground"} mb-2`}
                        >
                           Tier // {plan.tier}
                        </div>

                        <div className="mb-8 border-b border-border pb-8 flex items-baseline gap-2">
                           <span className="text-5xl font-bold tracking-tighter">
                              ${plan.price}
                           </span>
                           <span className="text-muted-foreground font-mono text-sm">/mo</span>
                        </div>

                        <ul className="space-y-4 mb-12 grow">
                           {plan.features.map((feature, j) => (
                              <li
                                 key={j}
                                 className="text-muted-foreground flex items-start gap-3 text-sm"
                              >
                                 <span className="text-accent mt-1">]</span>
                                 {feature}
                              </li>
                           ))}
                        </ul>

                        <Button
                           onClick={handlePricingClick}
                           className={`w-full rounded-none font-bold uppercase tracking-widest h-14 ${
                              plan.accent
                                 ? "bg-accent text-accent-foreground hover:bg-foreground hover:text-background"
                                 : "bg-background border border-border hover:bg-secondary text-foreground shadow-accent/10 shadow-sm"
                           }`}
                        >
                           {plan.accent ? "Initialize Pro" : "Select Tier"}
                        </Button>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="relative z-10 border-t border-border bg-card pt-20 pb-10 px-6 md:px-12 font-mono text-sm">
            <div className="max-w-7xl mx-auto">
               <div className="grid md:grid-cols-4 gap-12 mb-16">
                  <div className="col-span-1 md:col-span-2">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-4 h-4 bg-accent" />
                        <span className="text-xl font-sans font-bold tracking-tighter uppercase text-foreground">
                           Golf_Fair
                        </span>
                     </div>
                     <p className="text-muted-foreground max-w-sm mb-6 uppercase tracking-wide leading-relaxed">
                        Systematic charity distribution protocol via competitive golf performance
                        telemetry.
                     </p>
                  </div>

                  <div className="space-y-4">
                     <div className="text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2 inline-block">
                        Directory
                     </div>
                     <ul className="space-y-3 text-muted-foreground">
                        <li>
                           <a href="#" className="hover:text-accent transition-colors">
                              [ Features ]
                           </a>
                        </li>
                        <li>
                           <a href="#" className="hover:text-accent transition-colors">
                              [ Tiers ]
                           </a>
                        </li>
                        <li>
                           <a href="#" className="hover:text-accent transition-colors">
                              [ API Docs ]
                           </a>
                        </li>
                     </ul>
                  </div>

                  <div className="space-y-4">
                     <div className="text-foreground uppercase tracking-widest mb-6 border-b border-border pb-2 inline-block">
                        Legal_Ops
                     </div>
                     <ul className="space-y-3 text-muted-foreground">
                        <li>
                           <a href="#" className="hover:text-foreground transition-colors">
                              Privacy_Policy
                           </a>
                        </li>
                        <li>
                           <a href="#" className="hover:text-foreground transition-colors">
                              Terms_of_Service
                           </a>
                        </li>
                        <li>
                           <a href="#" className="hover:text-foreground transition-colors">
                              System_Status
                           </a>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-xs uppercase tracking-widest">
                  <p>© {new Date().getFullYear()} GOLF_FAIR PROTOCOL. ALL RIGHTS RESERVED.</p>
                  <div className="flex gap-6 mt-4 md:mt-0">
                     <a href="#" className="hover:text-accent transition-colors">
                        TWITTER
                     </a>
                     <a href="#" className="hover:text-accent transition-colors">
                        GITHUB
                     </a>
                     <a href="#" className="hover:text-accent transition-colors">
                        DISCORD
                     </a>
                  </div>
               </div>
            </div>
         </footer>
      </main>
   )
}
