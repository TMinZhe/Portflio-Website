import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { profile } from "@/content/profile";
import { plain } from "@/components/ui/content-text";
import { Providers } from "@/components/layout/providers";
import { effectsBootScript } from "@/lib/hooks/use-effects";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400"] });

const name = plain(profile.name);

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: `${name}, Computer Science at NUS`, template: `%s, ${name}` },
  description: profile.positioning,
  openGraph: { type: "website", title: name, description: profile.positioning },
};

export const viewport: Viewport = { themeColor: "#090b11", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: effectsBootScript }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
