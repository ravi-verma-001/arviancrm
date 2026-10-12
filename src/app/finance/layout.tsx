import { AppLayout } from "@/components/AppLayout";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
