import FloatingHeader from "@/components/ui/FloatingHeader";
import { Footer } from "@/components/Footer";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FloatingHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}