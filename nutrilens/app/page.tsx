import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Pill, Activity, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(74,222,128,0.2),transparent_50%)]" />

          <div className="relative container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Powered by Google Gemini AI</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
                Your AI-Powered{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Health Companion
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Snap a photo of your food, medication, or workout. Get instant, personalized health insights powered by
                advanced AI.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="text-lg px-8 h-14" asChild>
                  <Link href="/scan">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent" asChild>
                  <Link href="/dashboard">View Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need for better health</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three powerful tools in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Food Analysis</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Snap a photo of any meal to get instant nutritional breakdown, calorie estimates, and personalized
                dietary recommendations.
              </p>
              <Link
                href="/scan/food"
                className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
              >
                Try it now
                <span>→</span>
              </Link>
            </Card>

            <Card className="p-8 bg-card border-border hover:border-secondary/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <Pill className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Medication Scanner</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Scan medication labels to extract dosage instructions, side effects, and get plain-language explanations
                you can understand.
              </p>
              <Link
                href="/scan/medication"
                className="text-secondary hover:text-secondary/80 font-medium inline-flex items-center gap-2"
              >
                Scan label
                <span>→</span>
              </Link>
            </Card>

            <Card className="p-8 bg-card border-border hover:border-accent/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Exercise Insights</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Upload workout photos to get form corrections, posture analysis, and personalized exercise
                recommendations.
              </p>
              <Link
                href="/scan/exercise"
                className="text-accent hover:text-accent/80 font-medium inline-flex items-center gap-2"
              >
                Analyze form
                <span>→</span>
              </Link>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-balance">Health literacy made simple</h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  NutriLens makes complex health information accessible to everyone. No medical degree required.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">AI-Powered Insights</h3>
                      <p className="text-muted-foreground">
                        Advanced multimodal AI analyzes images and provides personalized recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Privacy First</h3>
                      <p className="text-muted-foreground">
                        Your health data stays secure and private. We never share your information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Instant Results</h3>
                      <p className="text-muted-foreground">Get comprehensive health insights in seconds, not hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 border border-border overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-muted-foreground">App preview coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Start your health journey today</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users making smarter health decisions with AI-powered insights
            </p>
            <Button size="lg" className="text-lg px-8 h-14" asChild>
              <Link href="/scan">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </div>
      {/* Footer */}
      <Footer />
    </>
  )
}
