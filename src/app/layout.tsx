import "./globals.css";
import Header from "../components/Header";
import Providers from "../components/Providers";

export const metadata = {
    title: "SafeScan",
    description: "A beginner-friendly web security scanner",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // suppressHydrationWarning is intentional — next-themes mutates this element
        <html lang="en" className="app-html" suppressHydrationWarning>
            <body className="app-body min-h-screen">
                <Providers>
                    <Header />
                    <main className="app-main p-8">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
