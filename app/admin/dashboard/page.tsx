import DashboardClient from "./DashboardClient";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const state = Array.isArray(params?.state) ? params?.state[0] : params?.state;

  return <DashboardClient initialState={state === "empty" ? "empty" : "populated"} />;
}
