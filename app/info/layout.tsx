import { InfoLayout } from "@/components/layout/InfoLayout";

export default function InfoSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InfoLayout>{children}</InfoLayout>;
}