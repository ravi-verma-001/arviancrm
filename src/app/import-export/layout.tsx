import { AppLayout } from "@/components/AppLayout";

export default function ImportExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
