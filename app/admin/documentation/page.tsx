export default function AdminDocumentationPage() {
   return (
      <div className="space-y-8 max-w-4xl">
         <div>
            <h1 className="text-3xl font-bold mb-2">Admin Documentation</h1>
            <p className="text-muted-foreground">
               Complete guide to managing the Golf Fair platform
            </p>
         </div>

         {/* Dashboard Overview */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-muted-foreground">
               The admin dashboard provides real-time statistics and management tools for the
               platform.
            </p>

            <div className="space-y-3 text-sm">
               <div>
                  <h3 className="font-bold text-accent mb-1">Key Metrics</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                     <li>Total Users: Active registered users on the platform</li>
                     <li>Total Scores: All golf scores submitted by users</li>
                     <li>Charity Funds: Total contributions to selected charities</li>
                     <li>Active Draws: Monthly draws pending or in progress</li>
                     <li>Pending Verifications: Winner verifications awaiting admin approval</li>
                  </ul>
               </div>
            </div>
         </section>

         {/* Draw Management */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Monthly Draw Management</h2>

            <div className="space-y-4">
               <div>
                  <h3 className="font-bold text-accent mb-2">Creating a Draw</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                     <li>Select the month and year for the draw</li>
                     <li>
                        Choose draw type:
                        <ul className="list-disc list-inside ml-4 mt-1">
                           <li>
                              <span className="text-foreground font-medium">Random:</span> Pure
                              random selection from eligible users
                           </li>
                           <li>
                              <span className="text-foreground font-medium">Algorithmic:</span>{" "}
                              Score-based selection favoring higher handicaps
                           </li>
                           <li>
                              <span className="text-foreground font-medium">Hybrid:</span>{" "}
                              Combination of score ranking and random selection
                           </li>
                        </ul>
                     </li>
                     <li>Click "Create Draw" to initialize</li>
                  </ol>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Executing a Draw</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                     <li>Navigate to the pending draw in the Draws Manager</li>
                     <li>Click "Execute Draw" button</li>
                     <li>System automatically selects winners based on draw type</li>
                     <li>Winners are placed in pending verification queue</li>
                  </ol>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Draw Statuses</h3>
                  <ul className="space-y-2 text-sm">
                     <li>
                        <span className="px-2 py-1 rounded text-yellow-400 bg-yellow-500/10">
                           Pending
                        </span>{" "}
                        - Draw created, waiting to be executed
                     </li>
                     <li>
                        <span className="px-2 py-1 rounded text-blue-400 bg-blue-500/10">
                           Drawn
                        </span>{" "}
                        - Winners selected, awaiting verification
                     </li>
                     <li>
                        <span className="px-2 py-1 rounded text-purple-400 bg-purple-500/10">
                           Verified
                        </span>{" "}
                        - All winners approved, ready to complete
                     </li>
                     <li>
                        <span className="px-2 py-1 rounded text-green-400 bg-green-500/10">
                           Completed
                        </span>{" "}
                        - Draw finished and prizes distributed
                     </li>
                  </ul>
               </div>
            </div>
         </section>

         {/* Winner Verification */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Winner Verification Process</h2>

            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">
                  All draw winners must be verified by an admin before prizes are distributed. This
                  ensures fairness and prevents gaming the system.
               </p>

               <div>
                  <h3 className="font-bold text-accent mb-2">Verification Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                     <li>Review pending winner in the Verification section</li>
                     <li>
                        Check user's:
                        <ul className="list-disc list-inside ml-4 mt-1">
                           <li>Account standing (no violations)</li>
                           <li>Last 5 golf scores (valid range: 0-45 Stableford)</li>
                           <li>Active subscription tier</li>
                           <li>Charity selection (10% contribution requirement met)</li>
                        </ul>
                     </li>
                     <li>Click "✓ Approve" to verify winner or "✗ Reject" to deny</li>
                     <li>If rejected, user retains eligibility for future draws</li>
                  </ol>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Rejection Reasons</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                     <li>Invalid score entries (outside 0-45 range)</li>
                     <li>Insufficient charitable contribution</li>
                     <li>Account status issues (suspended/flagged)</li>
                     <li>Missing required documentation</li>
                     <li>Suspected account abuse or anomalies</li>
                  </ul>
               </div>
            </div>
         </section>

         {/* User Management */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">User Management</h2>

            <div className="space-y-4">
               <div>
                  <h3 className="font-bold text-accent mb-2">User Roles</h3>
                  <ul className="space-y-2 text-sm">
                     <li>
                        <span className="font-medium text-foreground">Regular User:</span>
                        <p className="text-muted-foreground mt-1">
                           Can submit scores, participate in draws, support charities
                        </p>
                     </li>
                     <li>
                        <span className="font-medium text-foreground">Admin User:</span>
                        <p className="text-muted-foreground mt-1">
                           Can manage draws, verify winners, access audit logs, manage users
                        </p>
                     </li>
                  </ul>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Managing Admin Access</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                     <li>Go to "User Management" page</li>
                     <li>Find the user in the list (use search if needed)</li>
                     <li>Click "Make Admin" to grant or "Remove Admin" to revoke access</li>
                     <li>Action is logged in Audit Logs for compliance</li>
                  </ol>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Subscription Tiers</h3>
                  <ul className="space-y-2 text-sm">
                     <li>
                        <span className="font-medium text-gray-400">Free:</span>
                        <p className="text-muted-foreground">
                           Limited entries, basic draw participation
                        </p>
                     </li>
                     <li>
                        <span className="font-medium text-blue-400">Premium:</span>
                        <p className="text-muted-foreground">
                           Increased entry frequency, priority in hybrid draws
                        </p>
                     </li>
                     <li>
                        <span className="font-medium text-yellow-400">Elite:</span>
                        <p className="text-muted-foreground">
                           Unlimited entries, weighted draw selection, exclusive features
                        </p>
                     </li>
                  </ul>
               </div>
            </div>
         </section>

         {/* Audit Logs */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Audit Logs</h2>

            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">
                  All admin actions are logged for compliance and security purposes. Logs cannot be
                  deleted and provide complete audit trail.
               </p>

               <div>
                  <h3 className="font-bold text-accent mb-2">Logged Actions</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                     <li>Draw creation and execution</li>
                     <li>Winner verification and rejection</li>
                     <li>User admin privilege changes</li>
                     <li>User data modifications</li>
                     <li>System configuration changes</li>
                  </ul>
               </div>

               <div>
                  <h3 className="font-bold text-accent mb-2">Filtering & Searching</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                     Use filters to quickly find specific actions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                     <li>
                        <span className="font-medium text-green-400">Create:</span> All creation
                        events
                     </li>
                     <li>
                        <span className="font-medium text-blue-400">Verify:</span> Winner
                        verifications
                     </li>
                     <li>
                        <span className="font-medium text-red-400">Delete:</span> Deletion events
                     </li>
                     <li>
                        <span className="font-medium text-orange-400">Draw:</span> Draw-related
                        actions
                     </li>
                  </ul>
               </div>
            </div>
         </section>

         {/* Best Practices */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Admin Best Practices</h2>

            <div className="space-y-3 text-sm text-muted-foreground">
               <p>
                  ✓ <span className="text-foreground font-medium">Regular Verification:</span> Check
                  pending verifications daily to keep draws moving
               </p>
               <p>
                  ✓ <span className="text-foreground font-medium">Audit Trail Review:</span>{" "}
                  Regularly review audit logs for suspicious patterns
               </p>
               <p>
                  ✓ <span className="text-foreground font-medium">Admin Privileges:</span> Grant
                  admin access sparingly and to trusted users only
               </p>
               <p>
                  ✓ <span className="text-foreground font-medium">Draw Timing:</span> Execute draws
                  at consistent times each month for fairness
               </p>
               <p>
                  ✓ <span className="text-foreground font-medium">Documentation:</span> Add notes to
                  rejections for user transparency
               </p>
            </div>
         </section>

         {/* Security */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Security & Compliance</h2>

            <div className="space-y-3 text-sm text-muted-foreground">
               <p>
                  🔒 <span className="text-foreground font-medium">Access Control:</span> Only users
                  with admin flag can access admin pages
               </p>
               <p>
                  📝 <span className="text-foreground font-medium">Audit Logging:</span> All actions
                  are logged with timestamps and details
               </p>
               <p>
                  🔐 <span className="text-foreground font-medium">Data Privacy:</span> User data is
                  encrypted and access is logged
               </p>
               <p>
                  ⚙️ <span className="text-foreground font-medium">Row Level Security:</span>{" "}
                  Database policies prevent unauthorized data access
               </p>
               <p>
                  ✓ <span className="text-foreground font-medium">Verification:</span> Multi-step
                  winner verification prevents fraud
               </p>
            </div>
         </section>

         {/* Support */}
         <section className="rounded-lg border border-border bg-card/50 p-6 space-y-4">
            <h2 className="text-2xl font-bold">Support & Troubleshooting</h2>

            <div className="space-y-3 text-sm">
               <div>
                  <p className="font-medium text-foreground mb-1">
                     Issue: Draw not showing in list
                  </p>
                  <p className="text-muted-foreground">
                     Solution: Refresh the page or clear browser cache. Draws are updated in
                     real-time.
                  </p>
               </div>

               <div>
                  <p className="font-medium text-foreground mb-1">Issue: Can't verify winner</p>
                  <p className="text-muted-foreground">
                     Solution: Check if user account is in good standing and meets all requirements.
                  </p>
               </div>

               <div>
                  <p className="font-medium text-foreground mb-1">Issue: Audit logs not showing</p>
                  <p className="text-muted-foreground">
                     Solution: Logs appear after actions complete. Try refreshing or adjusting
                     filters.
                  </p>
               </div>
            </div>
         </section>
      </div>
   )
}
