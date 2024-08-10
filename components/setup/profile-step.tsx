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
import { FC } from "react"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"

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
  return (
    <>
      <div className="space-y-4">
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
            placeholder="e.g. Marketing Manager, Software Engineer"
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
            placeholder="Your company name"
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

        <div className="space-y-1">
          <Label>Use Cases</Label>
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
