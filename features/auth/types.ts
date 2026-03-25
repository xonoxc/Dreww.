export type FormStatus =
   | { status: "idle" }
   | { status: "loading" }
   | {
        status: "error"
        message: string
     }
