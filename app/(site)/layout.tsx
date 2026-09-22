import { SiteClientWrapper } from "@/components/layout/SiteClientWrapper";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteClientWrapper>{children}</SiteClientWrapper>;
}
