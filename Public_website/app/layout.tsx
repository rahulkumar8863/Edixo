import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Exam Prep Zone - Teacher Tools",
    description: "Advanced Question Bank, PDF Studio, and teaching tools for modern educators.",
};

const noto_sans = Noto_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-noto-sans" });
const noto_devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-noto-devanagari" });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${noto_sans.variable} ${noto_devanagari.variable} font-sans`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}

