import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { QuizParameters as QuizParametersType } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useTranslations } from 'next-intl'

interface AdvancedQuizOptionsProps {
  value: QuizParametersType
  onChange: (value: QuizParametersType) => void
  disabled?: boolean
}

export function AdvancedQuizOptions({ value, onChange, disabled }: AdvancedQuizOptionsProps) {
  const t = useTranslations('Dictation.form')

  const handleChange = (field: keyof QuizParametersType, newValue: number | boolean) => {
    onChange({
      ...value,
      [field]: newValue,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{t('advancedMode')}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h2 className="text-lg font-semibold mb-4">{t('advancedOptions')}</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiz-mode" className="cursor-pointer">{t('quizMode')}</Label>
            <Switch
              id="quiz-mode"
              checked={value.quizModeEnabled}
              onCheckedChange={checked => handleChange('quizModeEnabled', checked)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="global-time-limit">{t('globalTimeLimit')}</Label>
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
              <Label htmlFor="activity-time-limit">{t('activityTimeLimit')}</Label>
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
              <Label htmlFor="global-lives-limit">{t('livesLimit')}</Label>
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