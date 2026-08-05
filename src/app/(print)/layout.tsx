import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Completely bare layout — no sidebar, no header, nothing extra.
  // This ensures only the label content is present in the DOM when printing.
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f1f5f9", fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
