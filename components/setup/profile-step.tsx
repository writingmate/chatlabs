import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { FC, useState } from "react"
import { TablesInsert } from "@/supabase/types"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "@/components/languageswitcher/LanguageSwitcher"

interface ProfileStepProps {
  displayName: string
  onDisplayNameChange: (value: string) => void
  userQuestion: TablesInsert<"user_questions">
  onUserQuestionChange: (value: TablesInsert<"user_questions">) => void
}

export const ProfileStep: FC<ProfileStepProps> = ({
  displayName,
  onDisplayNameChange,
  userQuestion,
  onUserQuestionChange
}) => {
  const [showOtherSource, setShowOtherSource] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <Label>{t("Language")}</Label>
          <LanguageSwitcher />
        </div>
        <div className="space-y-1">
          <Label>{t("Your Name")}</Label>
          <Input
            placeholder={t("John Cena")}
            value={displayName}
            onChange={e => onDisplayNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>{t("Job Role")}</Label>
          <Input
            placeholder={t(
              "e.g. Marketing Manager, Software Engineer, or Student"
            )}
            value={userQuestion.job_role || ""}
            onChange={e =>
              onUserQuestionChange({
                ...userQuestion,
                job_role: e.target.value
              })
            }
          />
        </div>

        {/* Company Name and Company Size fields hidden */}

        <div className="space-y-1">
          <Label>{t("How did you hear about us?")}</Label>
          <Select
            value={userQuestion.source || ""}
            onValueChange={value => {
              onUserQuestionChange({ ...userQuestion, source: value })
              setShowOtherSource(value === "Other")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("Select an option")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Github">Github</SelectItem>
              <SelectItem value="Linkedin">Linked in</SelectItem>
              <SelectItem value="Instagram/Facebook">
                Instagram/Facebook
              </SelectItem>
              <SelectItem value="Friends">{t("Friend told me")}</SelectItem>
              <SelectItem value="Other">{t("Other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* "Please specify" field hidden */}

        {/* "What do you want to use ImogenAI for?" field and description hidden */}
      </div>
    </>
  )
}
