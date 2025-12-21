import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

// Ensure the root layout is treated as dynamic to avoid static prerender
// errors when environment variables (like Clerk keys) are not set in CI
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const appShell = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />

          <footer className="bg-white dark:bg-muted/50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-700 dark:text-gray-200">
              <p>Made by Tanu Agarwal-2024</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider when the publishable key is available.
  // This prevents build-time failures in CI where secrets may be absent.
  if (clerkPk) {
    return (
      <ClerkProvider
        publishableKey={clerkPk}
        appearance={{
          baseTheme: dark,
        }}
      >
        {appShell}
      </ClerkProvider>
    );
  }

  return appShell;
}
