import { AppLayout } from "@/components/AppLayout";

export default function ContentCalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
