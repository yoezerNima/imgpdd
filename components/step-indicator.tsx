import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Manual Process" },
    { number: 2, label: "Automation Ideas" },
    { number: 3, label: "Generate" },
  ]

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <li key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  step.number < currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : step.number === currentStep
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {step.number < currentStep ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  step.number <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-2 h-0.5 w-8 sm:w-16 ${step.number < currentStep ? "bg-primary" : "bg-border"}`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
