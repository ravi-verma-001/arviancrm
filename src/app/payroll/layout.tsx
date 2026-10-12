import { AppLayout } from "@/components/AppLayout";

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
