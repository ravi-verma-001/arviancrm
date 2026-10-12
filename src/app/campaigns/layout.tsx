import { AppLayout } from "@/components/AppLayout";

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
