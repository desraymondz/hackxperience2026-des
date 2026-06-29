import { redirect } from "next/navigation";

export default function JudgeLoginPage() {
  redirect("/login?role=judge");
}
