import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "McKinsey AI Market Research & Strategy Engine",
  description: "Governed AI market research workflow for strategy teams",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
