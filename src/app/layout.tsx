

import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Navbar from "@/components/NavBar";
import LayoutWrapper from '../components/LayoutWrapper';


export const metadata: Metadata = {
  title: "DSC Stablecoin",
  description: "A decentralized stablecoin built on the DSC protocol",

};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />

          <LayoutWrapper>{children}</LayoutWrapper>

        </Providers>
      </body>
    </html>
  );
}

