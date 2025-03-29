import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={GeistSans.variable} suppressHydrationWarning>
      <body className="bg-background">
        {children}
      </body>
    </html>
  );
}


