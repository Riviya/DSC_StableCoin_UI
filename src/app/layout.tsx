
import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";



export const metadata: Metadata = {
  title: "DSC Stablecoin",
  description: "A decentralized stablecoin built on the DSC protocol",

};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}

