import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { QuizParameters as QuizParametersType } from "@/lib/types"
import { QuizParameters } from "./QuizParameters"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface AdvancedQuizOptionsProps {
  value: QuizParametersType
  onChange: (value: QuizParametersType) => void
  disabled?: boolean
}

export function AdvancedQuizOptions({ value, onChange, disabled }: AdvancedQuizOptionsProps) {
  const handleChange = (field: keyof QuizParametersType, newValue: number | boolean) => {
    onChange({
      ...value,
      [field]: newValue,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Advanced Mode</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h2 className="text-lg font-semibold mb-4">Advanced Quiz Options</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiz-mode" className="cursor-pointer">Quiz Mode</Label>
            <Switch
              id="quiz-mode"
              checked={value.quizModeEnabled}
              onCheckedChange={checked => handleChange('quizModeEnabled', checked)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="global-time-limit">Global Time Limit (minutes)</Label>
              <Input
                id="global-time-limit"
                type="number"
                min={0}
                max={120}
                value={value.globalTimeLimit}
                onChange={e => handleChange('globalTimeLimit', parseInt(e.target.value) || 0)}
                className="mt-1"
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="activity-time-limit">Activity Time Limit (seconds)</Label>
              <Input
                id="activity-time-limit"
                type="number"
                min={0}
                max={300}
                value={value.activityTimeLimit}
                onChange={e => handleChange('activityTimeLimit', parseInt(e.target.value) || 0)}
                className="mt-1"
                disabled={disabled}
              />
            </div>

            <div>
              <Label htmlFor="global-lives-limit">Lives Limit</Label>
              <Input
                id="global-lives-limit"
                type="number"
                min={1}
                max={10}
                value={value.globalLivesLimit}
                onChange={e => handleChange('globalLivesLimit', parseInt(e.target.value) || 1)}
                className="mt-1"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 