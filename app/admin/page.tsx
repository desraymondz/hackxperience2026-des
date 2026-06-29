import { redirect } from "next/navigation";

// /admin has no dashboard of its own — send visitors to the login gate,
// mirroring app/judge/page.tsx.
export default function AdminPage() {
  redirect("/admin/login");
}
