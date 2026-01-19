import ControlPanel from "@/components/ControlPanel";
import { getToken } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = await getToken();
  if (token === null) {
    redirect('/login');
  }

  return <ControlPanel token={token} />;
}
