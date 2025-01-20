'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { QuizParameters as QuizParametersType } from "@/lib/types"

interface QuizParametersProps {
  value: QuizParametersType
  onChange: (value: QuizParametersType) => void
}

export function QuizParameters({ value, onChange }: QuizParametersProps) {
  const updateField = (field: keyof QuizParametersType, newValue: number | boolean) => {
    onChange({ ...value, [field]: newValue })
  }

  const incrementField = (field: keyof QuizParametersType, step: number, max: number) => {
    const currentValue = value[field]
    if (typeof currentValue === 'number') {
      onChange({ ...value, [field]: Math.min(currentValue + step, max) })
    }
  }

  const decrementField = (field: keyof QuizParametersType, step: number, min: number) => {
    const currentValue = value[field]
    if (typeof currentValue === 'number') {
      onChange({ ...value, [field]: Math.max(currentValue - step, min) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="quiz-mode">Quiz Mode</Label>
        <Switch
          id="quiz-mode"
          checked={value.quizModeEnabled}
          onCheckedChange={checked => updateField('quizModeEnabled', checked)}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="global-time">Global Time Limit (seconds)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => decrementField('globalTimeLimit', 30, 0)}
            >
              -
            </Button>
            <Input
              id="global-time"
              type="number"
              value={value.globalTimeLimit}
              onChange={e => updateField('globalTimeLimit', Math.max(0, Math.min(3600, parseInt(e.target.value) || 0)))}
              min={0}
              max={3600}
              step={30}
              className="w-24 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => incrementField('globalTimeLimit', 30, 3600)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-time">Activity Time Limit (seconds)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => decrementField('activityTimeLimit', 5, 0)}
            >
              -
            </Button>
            <Input
              id="activity-time"
              type="number"
              value={value.activityTimeLimit}
              onChange={e => updateField('activityTimeLimit', Math.max(0, Math.min(300, parseInt(e.target.value) || 0)))}
              min={0}
              max={300}
              step={5}
              className="w-24 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => incrementField('activityTimeLimit', 5, 300)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lives">Lives</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => decrementField('globalLivesLimit', 1, 1)}
            >
              -
            </Button>
            <Input
              id="lives"
              type="number"
              value={value.globalLivesLimit}
              onChange={e => updateField('globalLivesLimit', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              min={1}
              max={10}
              step={1}
              className="w-24 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => incrementField('globalLivesLimit', 1, 10)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 