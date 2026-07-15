import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Refilr — automated gas top-ups on Monad",
  description: "Deposit MON, register operational wallets, and let Refilr keep them topped up automatically.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
