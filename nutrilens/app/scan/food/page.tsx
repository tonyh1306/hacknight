"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NutritionData {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sodium: number
  insights: string[]
  recommendations: string[]
}

export default function FoodScannerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setNutritionData(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeFood = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock data - in production, this would call the Gemini API
    setNutritionData({
      foodName: "Grilled Chicken Salad with Quinoa",
      calories: 420,
      protein: 35,
      carbs: 42,
      fat: 12,
      fiber: 8,
      sodium: 380,
      insights: [
        "High protein content supports muscle maintenance and satiety",
        "Good balance of complex carbohydrates from quinoa",
        "Low in saturated fats, heart-healthy meal choice",
        "Excellent fiber content aids digestion",
      ],
      recommendations: [
        "Consider adding avocado for healthy omega-3 fats",
        "Reduce sodium by using less dressing or choosing low-sodium options",
        "Pair with a piece of fruit for additional vitamins",
      ],
    })

    setIsAnalyzing(false)
  }

  const resetScanner = () => {
    setSelectedImage(null)
    setNutritionData(null)
    setIsAnalyzing(false)
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <Camera className="w-4 h-4" />
                <span>Food Analysis</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Analyze Your Meal</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload a photo of your food to get instant nutritional insights and personalized recommendations
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <Card className="p-8 bg-card border-border">
                  {!selectedImage ? (
                    <div className="space-y-6">
                      <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium mb-1">Upload a photo</p>
                          <p className="text-sm text-muted-foreground">or drag and drop</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="file-upload">
                          <Button className="w-full" size="lg" asChild>
                            <span>
                              <Upload className="w-5 h-5 mr-2" />
                              Choose Image
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />

                        <Button variant="outline" className="w-full bg-transparent" size="lg">
                          <Camera className="w-5 h-5 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected food"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-3">
                        {!nutritionData && !isAnalyzing && (
                          <Button className="w-full" size="lg" onClick={analyzeFood}>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Analyze with AI
                          </Button>
                        )}

                        {isAnalyzing && (
                          <Button className="w-full" size="lg" disabled>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </Button>
                        )}

                        <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={resetScanner}>
                          Upload Different Image
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {nutritionData ? (
                  <>
                    <Card className="p-6 bg-card border-border">
                      <h2 className="text-2xl font-bold mb-4">{nutritionData.foodName}</h2>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">Calories</p>
                          <p className="text-3xl font-bold text-primary">{nutritionData.calories}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                          <p className="text-sm text-muted-foreground mb-1">Protein</p>
                          <p className="text-3xl font-bold text-secondary">{nutritionData.protein}g</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Carbohydrates</span>
                          <span className="font-semibold">{nutritionData.carbs}g</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Fat</span>
                          <span className="font-semibold">{nutritionData.fat}g</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Fiber</span>
                          <span className="font-semibold">{nutritionData.fiber}g</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Sodium</span>
                          <span className="font-semibold">{nutritionData.sodium}mg</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">AI Insights</h3>
                      <ul className="space-y-3">
                        {nutritionData.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">Recommendations</h3>
                      <ul className="space-y-3">
                        {nutritionData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Button className="w-full" size="lg" asChild>
                      <Link href="/dashboard">Save to Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <Card className="p-12 bg-card border-border">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">No analysis yet</h3>
                        <p className="text-sm text-muted-foreground">Upload a photo of your meal to get started</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
