import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SUPPORTED_LANGUAGES } from "@/lib/utils"

interface LanguageSelectorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  excludeLanguage?: string
  error?: string
  disabled?: boolean
}

export function LanguageSelector({
  id,
  label,
  value,
  onChange,
  excludeLanguage,
  error,
  disabled
}: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES
            .filter(lang => lang.name !== excludeLanguage)
            .map(lang => (
              <SelectItem key={lang.code} value={lang.name}>
                {lang.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
} 