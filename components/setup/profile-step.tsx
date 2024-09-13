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

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Your Name</Label>
            <Input
              placeholder="Steve Jobs"
              value={displayName}
              onChange={e => onDisplayNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Job Role</Label>
            <Input
              placeholder="e.g. Marketing Manager or Student"
              value={userQuestion.job_role || ""}
              onChange={e =>
                onUserQuestionChange({
                  ...userQuestion,
                  job_role: e.target.value
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Company Name</Label>
            <Input
              placeholder="Your company or school name"
              value={userQuestion.company_name || ""}
              onChange={e =>
                onUserQuestionChange({
                  ...userQuestion,
                  company_name: e.target.value
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Company Size</Label>
            <Select
              value={userQuestion.company_size || ""}
              onValueChange={e =>
                onUserQuestionChange({ ...userQuestion, company_size: e })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1001+">1001+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>How did you hear about us?</Label>
          <Select
            value={userQuestion.source || ""}
            onValueChange={value => {
              onUserQuestionChange({ ...userQuestion, source: value })
              setShowOtherSource(value === "Other")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
              <SelectItem value="Github">Github</SelectItem>
              <SelectItem value="Linkedin">Linked in</SelectItem>
              <SelectItem value="Instagram/Facebook">
                Instagram/Facebook
              </SelectItem>
              <SelectItem value="Friends">Friend told me</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showOtherSource && (
          <div className="space-y-1">
            <Label>Please specify:</Label>
            <Input
              placeholder="How did you hear about us?"
              value={userQuestion.other_source || ""}
              onChange={e =>
                onUserQuestionChange({
                  ...userQuestion,
                  other_source: e.target.value
                })
              }
            />
          </div>
        )}

        <div className="space-y-1">
          <Label>What do you want to use ChatLabs for?</Label>
          <Textarea
            placeholder="Describe how you plan to use ChatLabs"
            value={(userQuestion.use_cases as string) || ""}
            onChange={e =>
              onUserQuestionChange({
                ...userQuestion,
                use_cases: e.target.value
              })
            }
            rows={4}
          />
          <div className="text-xs text-gray-500">
            e.g. customer support, lead generation, etc. Founders read every
            response!
          </div>
        </div>
      </div>
    </>
  )
}
