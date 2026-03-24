import "./globals.css";

export const metadata = {
  title: {
    default: "Diverse Cleaning Service",
    template: "%s | Diverse Cleaning Service"
  },
  description: "Modern cleaning service booking platform with scheduling, payments, staff management, and automated notifications."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
