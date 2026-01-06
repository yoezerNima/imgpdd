import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { manualSteps, automationSteps, apiKey } = body

    const expectedApiKey = process.env.API_KEY
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 })
    }

    // Validate inputs
    if (!manualSteps || !automationSteps) {
      return NextResponse.json({ error: "Missing required fields: manualSteps and automationSteps" }, { status: 400 })
    }

    const manualDiagram = generateMermaidDiagram(manualSteps, "Manual Process Flow")
    const automationDiagram = generateMermaidDiagram(automationSteps, "Automated Process Flow")

    const manualPng = await convertMermaidToPng(manualDiagram)
    const automationPng = await convertMermaidToPng(automationDiagram)

    return NextResponse.json({
      success: true,
      diagrams: {
        manual: {
          png: manualPng,
          mermaidCode: manualDiagram,
        },
        automation: {
          png: automationPng,
          mermaidCode: automationDiagram,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error generating diagrams:", error)
    return NextResponse.json(
      { error: "Failed to generate diagrams", details: (error as Error).message },
      { status: 500 },
    )
  }
}

function generateMermaidDiagram(steps: string, title: string): string {
  const stepLines = steps
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.trim())

  let mermaidCode = "graph TD\n"
  mermaidCode += "    Start([Start])\n"

  stepLines.forEach((stepText, index) => {
    const stepId = `Step${index + 1}`
    const sanitizedText = stepText.replace(/"/g, "'")
    mermaidCode += `    ${stepId}["${sanitizedText}"]\n`
  })

  mermaidCode += "    End([End])\n\n"
  mermaidCode += "    Start --> Step1\n"

  for (let i = 1; i < stepLines.length; i++) {
    mermaidCode += `    Step${i} --> Step${i + 1}\n`
  }

  mermaidCode += `    Step${stepLines.length} --> End\n`

  return mermaidCode
}

async function convertMermaidToPng(mermaidCode: string): Promise<string> {
  // This is a free public service that converts Mermaid diagrams to images
  const encodedDiagram = Buffer.from(mermaidCode).toString("base64")
  const imageUrl = `https://mermaid.ink/img/${encodedDiagram}?type=png`

  // Fetch the PNG from mermaid.ink
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error("Failed to generate PNG from Mermaid diagram")
  }

  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  return `data:image/png;base64,${base64}`
}
