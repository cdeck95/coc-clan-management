import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import SideMenu from "@/components/sidemenu";
import MenuHeader from "@/components/menuheader";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "War Boiz Clan Management",
  description: "Manage your Clash of Clans 'War Boiz' clan",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-dvh">
            <SideMenu />
            <div className="flex flex-col flex-1 w-full h-full">
              <MenuHeader />
              <ScrollArea className="h-dvh w-full">
                <main className="flex-1 overflow-auto p-0 m-0 md:p-4">
                  {children}
                </main>
              </ScrollArea>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
