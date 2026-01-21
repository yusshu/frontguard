import AuthForm from "@/components/auth/AuthForm";
import { isAuthenticated } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Frontguard | Registro",
};

export default async function RegisterPage() {
  if (await isAuthenticated()) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br px-6 py-16 from-zinc-950 to-zinc-900">
      <AuthForm type="register" />  
    </main>
  );
}