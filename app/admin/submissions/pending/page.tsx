import SubmissionsClient from "../SubmissionsClient";

export default function PendingSubmissionsPage() {
  return <SubmissionsClient filter="pending" />;
}
