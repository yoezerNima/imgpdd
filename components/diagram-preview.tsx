"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import mermaid from "mermaid"

interface DiagramPreviewProps {
  title: string
  diagram: string
  type: "manual" | "automation"
}

export function DiagramPreview({ title, diagram, type }: DiagramPreviewProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>("")

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      themeVariables: {
        primaryColor: "#f5f5f5",
        primaryTextColor: "#171717",
        primaryBorderColor: "#525252",
        lineColor: "#525252",
        secondaryColor: "#e5e5e5",
        tertiaryColor: "#fafafa",
      },
    })

    const renderDiagram = async () => {
      if (diagramRef.current) {
        try {
          const { svg } = await mermaid.render(`mermaid-${type}-${Date.now()}`, diagram)
          setSvgContent(svg)
          diagramRef.current.innerHTML = svg
        } catch (error) {
          console.error("Error rendering diagram:", error)
        }
      }
    }

    renderDiagram()
  }, [diagram, type])

  const downloadDiagram = () => {
    if (!svgContent || !diagramRef.current) return

    const svgElement = diagramRef.current.querySelector("svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      ctx?.scale(2, 2)
      ctx?.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${type}-process-diagram.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, "image/png")
    }

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
  }

  return (
    <Card className="border border-border bg-card p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <Button onClick={downloadDiagram} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download PNG
        </Button>
      </div>
      <div
        ref={diagramRef}
        className="flex items-center justify-center overflow-x-auto rounded-lg border border-border bg-muted/30 p-8"
      />
    </Card>
  )
}
