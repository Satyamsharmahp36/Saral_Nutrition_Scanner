"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { getAnswer } from "@/scripts/langChain"
import MarkdownPreview from "@uiw/react-markdown-preview"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"
import ReactMarkdown from "react-markdown"
import Particles from "react-tsparticles"
import remarkGfm from "remark-gfm"
import { createWorker, Worker } from "tesseract.js"
import { loadFull } from "tsparticles"

import { BackgroundGradient } from "@/components/ui/background-gradient"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

interface AuroraBackgroundProps {
  children: React.ReactNode
}

const AuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute w-full min-h-screen overflow-hidden bg-black">
    <div className="absolute inset-0 h-full w-full">
      <div className="animate-aurora absolute inset-0 bg-gradient-to-r from-violet-400 via-cyan-500 to-emerald-600 opacity-20 blur-3xl" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 opacity-20 blur-3xl"
        style={{ animationDelay: "-1s" }}
      />
      <div
        className="animate-aurora absolute inset-0 bg-gradient-to-r from-violet-600 via-cyan-700 to-emerald-500 opacity-20 blur-3xl"
        style={{ animationDelay: "-2s" }}
      />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
)

const Home: React.FC = () => {
  const [imageData, setImageData] = useState<string | null>(null)
  const [progress, setProgress] = useState(100)
  const [progressLabel, setProgressLabel] = useState("idle")
  const [ocrResult, setOcrResult] = useState("")
  const [finalRes, setFinalRes] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDetailedMode, setIsDetailedMode] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const initializeWorker = async () => {
      // Create worker with progress tracking
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100))
          }
          console.log(m)
        },
      })

      workerRef.current = worker
    }

    initializeWorker()

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const handleExtract = async () => {
    setOcrResult("")
    setFinalRes("")
    if (!workerRef.current || !imageData) return

    setProgress(0)
    setProgressLabel("Starting OCR...")
    const worker = workerRef.current

    try {
      const { data } = await worker.recognize(imageData)
      setOcrResult(data.text)
      setProgressLabel("Image Recognition Done")
      handleFinal(data.text)
    } catch (error) {
      setProgressLabel("Error occurred during OCR")
      console.error("OCR error:", error)
    }
  }

  const loadFile = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImageData(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      loadFile(file)
    }
  }

  const handleSelectNewImage = () => {
    setImageData(null)
  }

  const handleFinal = async (ocrText: string) => {
    setIsLoading(true)
    try {
      const modePrompt = isDetailedMode
        ? `${ocrText} Provide a **detailed analysis** of the product. Include sodium, carbs, calories (kcal), fats, protein, and any harmful additives. Also, suggest health implications and improvements.`
        : `${ocrText} Summarize the product data in a **quick, simplified format**. Include a short table with key nutrients (sodium, carbs, calories) and clear warnings if needed.`

      const answer = await getAnswer(modePrompt)
      setFinalRes(answer)
      setHistory((prevHistory) => [...prevHistory, answer])
    } catch (error) {
      console.error("Analysis error:", error)
      setFinalRes("Unable to fetch analysis.")
    } finally {
      setIsLoading(false)
    }
  }

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  return (
    <AuroraBackground>
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          particles: {
            number: { value: 40 }, // Reduced for mobile
            size: { value: 2 },
            move: { enable: true, speed: 1.5 },
            color: { value: "#FFFFFF" },
            opacity: { value: 0.4 },
          },
        }}
      />

      <div className="absolute top-10 z-10 flex min-h-screen w-full justify-center items-center flex-col px-3 py-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4 sm:mb-8"
        >
          <div className="animated-background rounded-xl bg-gradient-to-r from-blue-400/50 via-blue-600/50 to-indigo-500/50 p-4 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl sm:p-6">
            <h1 className="bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-center font-mono text-6xl font-semibold text-transparent sm:text-8xl">
              SARAL
            </h1>
            <h2 className="bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-center font-mono text-2xl font-semibold text-transparent sm:text-3xl">
              Nutrition Analyzer
            </h2>
            <div className="mt-2 flex justify-end">
              <h4 className="sm:text-xl text-sm bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text font-mono font-semibold text-transparent">
                <a
                  href="https://github.com/Satyamsharmahp36"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1 text-blue-500 hover:bg-gray-200/10 hover:text-blue-400"
                >
                  Made by: Satyam Sharma
                </a>
              </h4>
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-sm text-center text-lg text-gray-100 sm:max-w-7xl sm:text-lg">
            Upload your nutrition label or ingredient list image of packed
            food and get detailed analysis of its contents, health
            implications, and recommendations.
          </p>
        </motion.div>

        
        <div className="flex-1 space-y-4">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mx-auto max-w-md"
          >
            <BackgroundGradient className="rounded-lg p-2 sm:p-4">
              <div
                className={`min-h-[200px] rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-600"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {!imageData ? (
                  <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3">
                    <Upload className="h-8 w-8 text-gray-400 sm:h-24 sm:w-10" />
                    <p className="text-lg text-gray-300 sm:text-lg">
                      Drag and drop your image here or{" "}
                      <label className="cursor-pointer text-blue-500 hover:text-blue-400">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) loadFile(file)
                          }}
                        />
                      </label>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative mx-auto h-[200px] w-full max-w-xs sm:h-[400px]">
                      <Image
                        src={imageData}
                        alt="Uploaded label"
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-lg"
                      />
                    </div>
                    <Button
                      className="text-base sm:text-lg"
                      variant="secondary"
                      onClick={handleSelectNewImage}
                    >
                      Select New Image
                    </Button>
                  </div>
                )}
              </div>
            </BackgroundGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto max-w-md"
          >
            <Card className="border-gray-800 bg-black/50 backdrop-blur-sm">
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-white sm:text-2xl">
                  Analysis Controls
                </CardTitle>
                <CardDescription className="sm:text-lg text-base">
                  Extract and analyze the nutrition data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-base font-medium text-gray-300 sm:text-lg"
                    htmlFor="mode-toggle"
                  >
                    {isDetailedMode ? "Detailed Review" : "Quick Summary"}
                  </label>
                  <Switch
                    id="mode-toggle"
                    checked={isDetailedMode}
                    onChange={setIsDetailedMode}
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    className="w-full bg-white text-base text-black hover:bg-blue-500 hover:text-white sm:text-sm"
                    variant="secondary"
                    onClick={handleExtract}
                    disabled={!imageData || isLoading}
                  >
                    Extract & Analyze
                  </Button>
                  <Button
                    onClick={() => setShowHistory((prev) => !prev)}
                    className="w-full bg-gray-600 text-base text-white hover:bg-gray-700 sm:text-sm"
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto max-w-md"
          >
            {progress < 100 || progressLabel === "Image Recognition Done" ? (
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-base text-gray-400 sm:text-sm">
                  <span>{progressLabel}</span>
                  <span>
                    {progressLabel === "Image Recognition Done"
                      ? "100%"
                      : `${progress}%`}
                  </span>
                </div>
                <Progress
                  value={
                    progressLabel === "Image Recognition Done" ? 100 : progress
                  }
                  className="h-1.5 sm:h-2"
                />
              </div>
            ) : null}

            {isLoading ? (
              <div className="text-center text-gray-400">
                <p className="text-base sm:text-lg">Analyzing your data...</p>
                <div className="loader mx-auto mt-4 h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500 sm:h-8 sm:w-8 sm:border-4" />
              </div>
            ) : (
              <MarkdownPreview
                source={
                  finalRes ||
                  "Upload an image and click 'Extract & Analyze' to get started."
                }
                className="rounded-md bg-gray-900 p-3 text-sm text-white shadow-md sm:p-4 sm:text-base"
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)"
                }}
              />
            )}
          </motion.div>
        </div>

        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-3 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-slate-600 p-4 shadow-xl sm:max-w-md">
              <h3 className="mb-3 text-white border-b pb-2 text-xl font-semibold  sm:text-2xl">
                History
              </h3>
              {history.length > 0 ? (
                <ul className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="rounded-lg border border-gray-700 bg-gray-900 p-2 text-sm shadow-sm transition-shadow duration-150 hover:shadow-md sm:p-3 sm:text-lg"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item}
                      </ReactMarkdown>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-lg text-gray-500 sm:text-sm">
                  <p>No history found</p>
                </div>
              )}
              <Button
                variant="outline"
                className="mt-4 w-full bg-gray-800 text-base text-white transition-colors hover:bg-gray-700 sm:text-lg"
                onClick={() => setShowHistory(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  </AuroraBackground>
)
}

export default Home