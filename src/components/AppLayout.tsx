import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayoutClient } from "./AppLayoutClient";

interface AppLayoutProps {
  children: React.ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayoutClient user={user}>
      {children}
    </AppLayoutClient>
  );
}
