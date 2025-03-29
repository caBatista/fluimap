import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


