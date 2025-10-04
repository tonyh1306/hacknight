"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, TrendingDown, Camera, Pill, Activity, Calendar } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  const recentScans = [
    {
      id: 1,
      type: "food",
      name: "Grilled Chicken Salad",
      calories: 420,
      date: "Today, 12:30 PM",
      icon: Camera,
      color: "primary",
    },
    {
      id: 2,
      type: "medication",
      name: "Metformin HCl 500mg",
      dosage: "Twice daily",
      date: "Today, 8:00 AM",
      icon: Pill,
      color: "secondary",
    },
    {
      id: 3,
      type: "food",
      name: "Oatmeal with Berries",
      calories: 280,
      date: "Yesterday, 7:45 AM",
      icon: Camera,
      color: "primary",
    },
    {
      id: 4,
      type: "food",
      name: "Salmon with Vegetables",
      calories: 520,
      date: "Yesterday, 6:30 PM",
      icon: Camera,
      color: "primary",
    },
  ]

  const weeklyStats = {
    avgCalories: 1850,
    caloriesTrend: "down",
    scansCompleted: 12,
    scansTrend: "up",
    proteinAvg: 95,
    proteinTrend: "up",
  }

  const insights = [
    {
      title: "Great protein intake",
      description: "You've been consistently hitting your protein goals this week. Keep it up!",
      type: "positive",
    },
    {
      title: "Sodium levels high",
      description: "Your sodium intake has been above recommended levels. Consider reducing processed foods.",
      type: "warning",
    },
    {
      title: "Medication adherence",
      description: "You've taken your medications on schedule for 7 days straight. Excellent consistency!",
      type: "positive",
    },
  ]

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">Your Health Dashboard</h1>
                <p className="text-xl text-muted-foreground">
                  Track your nutrition, medications, and wellness insights
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/scan/food">
                  <Camera className="w-5 h-5 mr-2" />
                  New Scan
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Daily Calories</h3>
                  {weeklyStats.caloriesTrend === "down" ? (
                    <TrendingDown className="w-5 h-5 text-secondary" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-4xl font-bold mb-1">{weeklyStats.avgCalories}</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Scans Completed</h3>
                  {weeklyStats.scansTrend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <p className="text-4xl font-bold mb-1">{weeklyStats.scansCompleted}</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Protein</h3>
                  {weeklyStats.proteinTrend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-primary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <p className="text-4xl font-bold mb-1">{weeklyStats.proteinAvg}g</p>
                <p className="text-sm text-muted-foreground">This week</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentScans.map((scan) => (
                    <Card key={scan.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            scan.color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                          }`}
                        >
                          <scan.icon
                            className={`w-6 h-6 ${scan.color === "primary" ? "text-primary" : "text-secondary"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{scan.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{scan.date}</p>
                          {scan.type === "food" && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {scan.calories} calories
                            </div>
                          )}
                          {scan.type === "medication" && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                              {scan.dosage}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">AI Insights</h2>

                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Card
                      key={index}
                      className={`p-5 bg-card border ${
                        insight.type === "positive"
                          ? "border-secondary/30 bg-secondary/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            insight.type === "positive" ? "bg-secondary" : "bg-destructive"
                          }`}
                        />
                        <div>
                          <h3 className="font-semibold mb-2">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Get More Insights</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Scan more meals and medications to unlock personalized health recommendations
                      </p>
                      <Button size="sm" asChild>
                        <Link href="/scan/food">Start Scanning</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="p-8 bg-card border-border">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-3 bg-transparent" asChild>
                  <Link href="/scan/food">
                    <Camera className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <p className="font-semibold">Scan Food</p>
                      <p className="text-xs text-muted-foreground">Analyze your meal</p>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-3 bg-transparent" asChild>
                  <Link href="/scan/medication">
                    <Pill className="w-8 h-8 text-secondary" />
                    <div className="text-center">
                      <p className="font-semibold">Scan Medication</p>
                      <p className="text-xs text-muted-foreground">Read your label</p>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-3 bg-transparent" asChild>
                  <Link href="/scan/exercise">
                    <Activity className="w-8 h-8 text-accent" />
                    <div className="text-center">
                      <p className="font-semibold">Analyze Exercise</p>
                      <p className="text-xs text-muted-foreground">Check your form</p>
                    </div>
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
