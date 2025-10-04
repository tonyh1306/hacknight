"use client";

import type React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MedicationData {
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  instructions: string[];
  warnings: string[];
  sideEffects: string[];
  plainLanguage: string;
}

export default function MedicationScannerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(
    null
  );
  const [lastResponse, setLastResponse] = useState<any | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMedicationData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMedication = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);

    try {
      // Fetch data URL and convert to blob
      const res = await fetch(selectedImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "upload.jpg");

      // POST to backend analyze endpoint which calls Gemini service
      const resp = await fetch("http://localhost:8000/analyze-meds", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
      const data = await resp.json();
      setLastResponse(data);

      // Map backend response (expected shape: { text: { medicationName, genericName, dosage, frequency, instructions, warnings, sideEffects, plainLanguage } })
      const medData: MedicationData = {
        medicationName: (data.text?.medicationName as string) || "Unknown",
        genericName: (data.text?.genericName as string) || "",
        dosage: (data.text?.dosage as string) || "",
        frequency: (data.text?.frequency as string) || "",
        instructions: (data.text?.instructions as string[]) || [],
        warnings: (data.text?.warnings as string[]) || [],
        sideEffects: (data.text?.sideEffects as string[]) || [],
        plainLanguage: (data.text?.plainLanguage as string) || "",
      };

      // If we only received a plain text fallback (no structured fields), keep medicationData null and show diagnostics
      const looksEmpty =
        medData.medicationName === "Unknown" &&
        medData.instructions.length === 0 &&
        medData.plainLanguage === "";
      if (!looksEmpty) {
        setMedicationData(medData);
      } else {
        setMedicationData(null);
      }
    } catch (err) {
      console.error("Analyze error", err);
      alert("Failed to analyze medication. See console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setMedicationData(null);
    setIsAnalyzing(false);
  };

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
                <span>Medication Analysis</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Analyze Your Medication
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload a photo of your medication label to get clear
                instructions, warnings, and plain-language explanations
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
                          <p className="font-medium mb-1">
                            Upload a medication label
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or drag and drop
                          </p>
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

                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          size="lg"
                        >
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
                          alt="Selected medication"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-3">
                        {!medicationData && !isAnalyzing && (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={analyzeMedication}
                          >
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

                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          size="lg"
                          onClick={resetScanner}
                        >
                          Upload Different Image
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {medicationData ? (
                  <>
                    <Card className="p-6 bg-card border-border">
                      <h2 className="text-2xl font-bold mb-4">
                        {medicationData.medicationName}
                      </h2>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <p className="text-sm text-muted-foreground mb-1">
                            Dosage
                          </p>
                          <p className="text-3xl font-bold text-primary">
                            {medicationData.dosage}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                          <p className="text-sm text-muted-foreground mb-1">
                            Frequency
                          </p>
                          <p className="text-3xl font-bold text-secondary">
                            {medicationData.frequency}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Generic</span>
                          <span className="font-semibold">
                            {medicationData.genericName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Side Effects
                          </span>
                          <span className="font-semibold">
                            {medicationData.sideEffects.join(", ")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span className="text-muted-foreground">Extra</span>
                          <span className="font-semibold">
                            See details below
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">AI Insights</h3>
                      <ul className="space-y-3">
                        {medicationData.instructions.map((insight, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">
                              {insight}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">Warnings</h3>
                      <ul className="space-y-3">
                        {medicationData.warnings.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">
                              {rec}
                            </span>
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
                        <p className="text-sm text-muted-foreground">
                          Upload a photo of your medication label to get started
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                {/* Diagnostics: show raw backend response when structured data is missing */}
                {!medicationData && lastResponse && (
                  <Card className="p-6 bg-card border-border mt-4">
                    <h3 className="text-lg font-bold mb-2">
                      Analysis Diagnostics
                    </h3>
                    <div className="text-sm text-muted-foreground mb-3">
                      The AI response did not include parsed medication fields.
                      Raw response:
                    </div>
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                      {JSON.stringify(lastResponse, null, 2)}
                    </pre>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
