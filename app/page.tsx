"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DiagramPreview } from "@/components/diagram-preview"
import { StepIndicator } from "@/components/step-indicator"
import { ArrowRight, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProcessDiagramGenerator() {
  const [step, setStep] = useState(1)
  const [manualSteps, setManualSteps] = useState("")
  const [automationSteps, setAutomationSteps] = useState("")
  const [diagrams, setDiagrams] = useState<{
    manual: string | null
    automation: string | null
  }>({ manual: null, automation: null })
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const handleNext = () => {
    if (step === 1 && !manualSteps.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter manual process steps",
        variant: "destructive",
      })
      return
    }
    setStep(2)
  }

  const generateDiagrams = () => {
    if (!automationSteps.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter automation steps",
        variant: "destructive",
      })
      return
    }

    const manualDiagram = generateMermaidDiagram(manualSteps, "Manual Process Flow")
    const automationDiagram = generateMermaidDiagram(automationSteps, "Automated Process Flow")

    setDiagrams({
      manual: manualDiagram,
      automation: automationDiagram,
    })
    setStep(3)
  }

  const generateMermaidDiagram = (steps: string, title: string) => {
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

  const sendToPowerAutomate = async () => {
    setSending(true)
    try {
      // Convert diagrams to data
      const payload = {
        diagrams: [
          {
            type: "Manual",
            content: diagrams.manual,
            timestamp: new Date().toISOString(),
          },
          {
            type: "Automation",
            content: diagrams.automation,
            timestamp: new Date().toISOString(),
          },
        ],
      }

      // Replace with your Power Automate webhook URL
      const webhookUrl = process.env.NEXT_PUBLIC_POWER_AUTOMATE_WEBHOOK_URL

      if (!webhookUrl) {
        toast({
          title: "Configuration Required",
          description: "Please set NEXT_PUBLIC_POWER_AUTOMATE_WEBHOOK_URL in environment variables",
          variant: "destructive",
        })
        setSending(false)
        return
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Diagrams sent to Power Automate successfully",
        })
      } else {
        throw new Error("Failed to send to Power Automate")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send diagrams to Power Automate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setManualSteps("")
    setAutomationSteps("")
    setDiagrams({ manual: null, automation: null })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Process Diagram Generator</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="mb-8 border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">API Integration</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Send process data from Power Automate to generate PNG diagrams automatically.
          </p>
          <div className="rounded-md bg-muted p-4 font-mono text-xs">
            <div className="mb-2 font-semibold">POST /api/generate-diagrams</div>
            <pre className="text-muted-foreground">{`{
  "manualSteps": "Step 1\\nStep 2\\nStep 3",
  "automationSteps": "Auto Step 1\\nAuto Step 2",
  "apiKey": "your-api-key-here"
}`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Optional: Set API_KEY in environment variables for authentication
          </p>
        </Card>

        <div className="mb-8">
          <StepIndicator currentStep={step} />
        </div>

        {step === 1 && (
          <Card className="border border-border bg-card p-8">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Step 1: Manual Process</h2>
              <p className="text-sm text-muted-foreground">Describe your current manual steps, one per line</p>
            </div>
            <Textarea
              placeholder="Enter each manual step on a new line&#10;Example:&#10;Receive request via email&#10;Review request details&#10;Update spreadsheet&#10;Send confirmation email"
              value={manualSteps}
              onChange={(e) => setManualSteps(e.target.value)}
              className="mb-6 min-h-[300px] font-mono text-sm"
            />
            <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
              Continue to Automation Ideas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card className="border border-border bg-card p-8">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Step 2: Automation Ideas</h2>
              <p className="text-sm text-muted-foreground">Describe how these steps could be automated, one per line</p>
            </div>
            <Textarea
              placeholder="Enter each automation step on a new line&#10;Example:&#10;Webhook receives request data&#10;Automated validation check&#10;Database auto-update&#10;Trigger confirmation email"
              value={automationSteps}
              onChange={(e) => setAutomationSteps(e.target.value)}
              className="mb-6 min-h-[300px] font-mono text-sm"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setStep(1)} variant="outline" size="lg" className="w-full sm:w-auto">
                Back
              </Button>
              <Button onClick={generateDiagrams} size="lg" className="w-full sm:w-auto">
                Generate Diagrams
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && diagrams.manual && diagrams.automation && (
          <div className="space-y-8">
            <DiagramPreview title="Manual Process Flow" diagram={diagrams.manual} type="manual" />
            <DiagramPreview title="Automated Process Flow" diagram={diagrams.automation} type="automation" />

            <Card className="border border-border bg-card p-8">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={resetFlow} variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  Start Over
                </Button>
                <Button onClick={sendToPowerAutomate} disabled={sending} size="lg" className="w-full sm:w-auto">
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      Send to Power Automate
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Configure your Power Automate webhook URL in the Vars section of the sidebar:
                NEXT_PUBLIC_POWER_AUTOMATE_WEBHOOK_URL
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
