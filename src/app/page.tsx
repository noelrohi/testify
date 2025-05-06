import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import {
  ComputerIcon,
  GiftIcon,
  PuzzleIcon,
  SparklesIcon,
  ThumbsUpIcon,
} from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

const features: Array<{
  title: string;
  description: string;
  icon: JSX.Element;
}> = [
  {
    title: "Generous Free Tier",
    description:
      "Get started without reaching for your wallet. Perfect for new launches.",
    // TODO: Replace with actual icon component if available, e.g., from @tabler/icons-react
    icon: <GiftIcon />, // Placeholder icon
  },
  {
    title: "Developer-Friendly",
    description:
      "Integrate quickly with our straightforward API and SDK documentation.",
    // TODO: Replace with actual icon component
    icon: <ComputerIcon />, // Placeholder icon
  },
  {
    title: "AI-Powered Assistance",
    description:
      'Craft the perfect testimonial request prompts with AI "vibe coding".',
    // TODO: Replace with actual icon component
    icon: <SparklesIcon />, // Placeholder icon
  },
  {
    title: "Simple Integration",
    description:
      "Copy-paste a snippet or use our SDK. Displaying testimonials is easy.",
    // TODO: Replace with actual icon component
    icon: <PuzzleIcon />, // Placeholder icon
  },
  {
    title: "Authentic Social Proof",
    description:
      "Build trust by showcasing real feedback from happy customers.",
    // TODO: Replace with actual icon component
    icon: <ThumbsUpIcon />, // Placeholder icon
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link
          href="#"
          className="flex items-center justify-center font-display font-semibold text-2xl"
          prefetch={false}
        >
          Testify.xyz
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            How it Works
          </Link>
          <Button size="sm" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-muted">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-foreground font-display">
              Effortless Testimonials for Your New Website
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Integrate social proof in minutes with our simple API and SDK.
              Start collecting and displaying authentic testimonials today.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-background"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12 font-display">
              Why Choose Testify.xyz?
            </h2>
            <FeaturesSectionWithHoverEffects features={features} />
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12 font-display">
              Get Started in Minutes
            </h2>
            <div className="mx-auto grid max-w-3xl items-center gap-8 sm:grid-cols-3 md:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mb-2">
                  1
                </div>
                <h3 className="text-lg font-semibold">Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  Create your free account.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mb-2">
                  2
                </div>
                <h3 className="text-lg font-semibold">Integrate</h3>
                <p className="text-sm text-muted-foreground">
                  Add the snippet or use the API/SDK.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl mb-2">
                  3
                </div>
                <h3 className="text-lg font-semibold">Collect & Display</h3>
                <p className="text-sm text-muted-foreground">
                  Start gathering and showing testimonials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-display">
                Ready to Build Trust with Testimonials?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Testify.xyz today and let your customers speak for you.
                It's free to get started!
              </p>
            </div>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Testify.xyz. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/terms"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
