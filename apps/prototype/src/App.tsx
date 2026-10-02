import { type FormEvent, useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function App() {
  const [name, setName] = useState("Olivia Martin")
  const [language, setLanguage] = useState("en")
  const [notifications, setNotifications] = useState(true)
  const [research, setResearch] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showError, setShowError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalid = name.trim().length === 0
    setShowError(invalid)
    setSubmitted(!invalid)
  }

  return (
    <main className="min-h-svh px-4 py-8 sm:px-6 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Figma → shadcn pilot
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Account settings
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              A working prototype styled with tokens exported from Test Project 2.
            </p>
          </div>
          <span className="hidden rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            Orange theme
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-card p-5 shadow-sm sm:p-7 md:p-8"
          noValidate
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <label htmlFor="display-name" className="text-sm font-medium">
                Display name
              </label>
              <Input
                id="display-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setSubmitted(false)
                  if (event.target.value.trim()) setShowError(false)
                }}
                aria-invalid={showError}
                aria-describedby={showError ? "display-name-error" : "display-name-help"}
              />
              <p
                id={showError ? "display-name-error" : "display-name-help"}
                className={showError ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
              >
                {showError ? "Enter a display name before saving." : "This name appears across your workspace."}
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="w-full" aria-label="Language">
                  <SelectValue placeholder="Choose a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                  <SelectItem value="pl">Polski</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Used for navigation, labels, and system messages.
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="flex min-h-11 items-center justify-between gap-5">
              <div>
                <label htmlFor="notifications" className="cursor-pointer text-sm font-medium">
                  Email notifications
                </label>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Receive product updates and important account alerts.
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                aria-label="Email notifications"
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg py-2">
              <Checkbox
                checked={research}
                onCheckedChange={(checked) => setResearch(checked === true)}
                aria-label="Join research program"
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium">Join the research program</span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Allow the team to invite you to occasional product interviews.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className="min-h-5">
              {submitted && (
                <p className="flex items-center gap-2 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Settings saved
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none">
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

export default App
