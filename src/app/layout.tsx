import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Somnath NX - Premium Nightwear & Loungewear",
  description: "Discover premium comfort, modern styles, and breathable fabrics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-bg-base text-dark">
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
