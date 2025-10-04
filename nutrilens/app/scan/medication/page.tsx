"use client";

import type React from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Upload,
  Loader2,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
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

type ResponseShape = { text?: Record<string, unknown> };

// Small helpers to safely extract typed values from unknown response shapes
const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

export default function MedicationScannerPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setUploadProgress(null);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setMedicationData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  // analyzeMedication now supports three flows:
  // 1) capture=true -> server-side capture (existing)
  // 2) selectedImage present -> upload File
  // 3) pass a Blob (from local camera) as the "blob" argument
  const analyzeMedication = async (capture: boolean = false, blob?: Blob) => {
    setIsAnalyzing(true);
    setError(null);
    setUploadProgress(null);

    try {
      const formData = new FormData();

      if (blob) {
        formData.append("file", blob, "capture.jpg");
      } else if (!capture && selectedImage) {
        formData.append("file", selectedImage);
      }

      const query = capture ? "?capture=true" : "";

      // Use XMLHttpRequest when sending a file to get upload progress updates
      const url = `http://localhost:8000/analyze-meds${query}`;
      let responseJson: ResponseShape | null = null;

      if (formData.has("file")) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url);
          xhr.onload = () => {
            try {
              if (xhr.status >= 200 && xhr.status < 300) {
                responseJson = JSON.parse(xhr.responseText) as ResponseShape;
                resolve();
              } else {
                reject(new Error(`Server returned ${xhr.status}`));
              }
            } catch (e) {
              reject(e);
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.send(formData);
        });
      } else {
        // No file in formData -> may be capture=true server-side path
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        responseJson = (await res.json()) as ResponseShape;
      }

      const data = responseJson ?? {};

      // Transform Gemini response into MedicationData structure (type-safe)
      const text = data.text ?? {};
      const medData: MedicationData = {
        medicationName:
          asString((text as Record<string, unknown>).medicationName) ||
          "Unknown",
        genericName: asString((text as Record<string, unknown>).genericName),
        dosage: asString((text as Record<string, unknown>).dosage),
        frequency: asString((text as Record<string, unknown>).frequency),
        instructions: asStringArray(
          (text as Record<string, unknown>).instructions
        ),
        warnings: asStringArray((text as Record<string, unknown>).warnings),
        sideEffects: asStringArray(
          (text as Record<string, unknown>).sideEffects
        ),
        plainLanguage:
          asString((text as Record<string, unknown>).plainLanguage) ||
          asString((text as Record<string, unknown>).summary) ||
          "",
      };

      setMedicationData(medData);
    } catch (err: unknown) {
      console.error("Error analyzing medication:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to analyze medication. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(null);
    }
  };

  const openCamera = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(s);
      setShowCameraModal(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e: unknown) {
      console.error("Camera error", e);
      setError(e instanceof Error ? e.message : "Unable to access camera");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );
    if (blob) {
      // preview
      const url = URL.createObjectURL(blob);
      setPreviewImage(url);
      setSelectedImage(null);
      setMedicationData(null);
      closeCamera();
      await analyzeMedication(false, blob);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setPreviewImage(null);
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
                <Camera className="w-4 h-4" />
                <span>Medication Scanner</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Scan Your Medication
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload a photo of your medication label to get clear,
                easy-to-understand instructions and safety information
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-6">
                <Card className="p-8 bg-card border-border">
                  {!previewImage ? (
                    <div className="space-y-6">
                      <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-4 hover:border-secondary/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-secondary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium mb-1">
                            Upload medication label
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Clear photo of the label works best
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="med-file-upload">
                          <Button
                            className="w-full bg-secondary hover:bg-secondary/90"
                            size="lg"
                            asChild
                          >
                            <span>
                              <Upload className="w-5 h-5 mr-2" />
                              Choose Image
                            </span>
                          </Button>
                        </label>
                        <input
                          id="med-file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />

                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          size="lg"
                          onClick={openCamera}
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Capture with Camera
                        </Button>
                        {uploadProgress !== null && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Uploading: {uploadProgress}%
                          </p>
                        )}
                        {error && (
                          <p className="text-sm text-destructive mt-2">
                            {error}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Selected medication label"
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-3">
                        {!medicationData && !isAnalyzing && (
                          <Button
                            className="w-full bg-secondary hover:bg-secondary/90"
                            size="lg"
                            onClick={() => analyzeMedication(false)}
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Analyze Label
                          </Button>
                        )}

                        {isAnalyzing && (
                          <Button
                            className="w-full bg-secondary hover:bg-secondary/90"
                            size="lg"
                            disabled
                          >
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

                {/* Disclaimer */}
                <Card className="p-4 bg-muted/50 border-border">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This tool provides general information only. Always
                      consult your healthcare provider for medical advice and
                      follow their instructions.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {medicationData ? (
                  <>
                    <Card className="p-6 bg-card border-border">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          {medicationData.medicationName}
                        </h2>
                        <p className="text-muted-foreground">
                          Generic: {medicationData.genericName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                          <p className="text-sm text-muted-foreground mb-1">
                            Dosage
                          </p>
                          <p className="text-2xl font-bold text-secondary">
                            {medicationData.dosage}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                          <p className="text-sm text-muted-foreground mb-1">
                            Frequency
                          </p>
                          <p className="text-2xl font-bold text-accent">
                            {medicationData.frequency}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">
                        In Plain Language
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {medicationData.plainLanguage}
                      </p>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">How to Take</h3>
                      <ul className="space-y-3">
                        {medicationData.instructions.map(
                          (instruction, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-semibold text-secondary">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-muted-foreground leading-relaxed">
                                {instruction}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </Card>

                    <Card className="p-6 bg-card border-destructive/20">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <h3 className="text-lg font-bold">
                          Important Warnings
                        </h3>
                      </div>
                      <ul className="space-y-3">
                        {medicationData.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">
                              {warning}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                      <h3 className="text-lg font-bold mb-4">
                        Possible Side Effects
                      </h3>
                      <ul className="space-y-3">
                        {medicationData.sideEffects.map((effect, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">
                              {effect}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Button
                      className="w-full bg-secondary hover:bg-secondary/90"
                      size="lg"
                      asChild
                    >
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
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
