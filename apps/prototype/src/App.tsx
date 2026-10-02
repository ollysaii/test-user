import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  ChevronRight,
  FileText,
  LoaderCircle,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ApplicationFlow } from "@/ApplicationFlow"

type Screen = "guest" | "loginRequired" | "phone" | "otp" | "consent" | "confirmation" | "destination" | "recovery" | "callback" | "callbackSuccess" | "application"
type Intent = "home" | "purchase" | "policy" | "case" | "accident" | "unavailable"
type AuthMode = "register" | "login"
type Sheet = "terms" | "privacy" | "support" | "accident" | "policies" | "vehicle" | "policy" | null
type RequestStage = "phone" | "otp" | "profile"

const NEW_PHONE = "671234542"
const EXISTING_PHONE = "671234511"

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9)
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(" ")
}

function maskedPhone(value: string) {
  const formatted = formatPhone(value)
  return formatted.length === 12 ? `+380 ${formatted.slice(0, 3)}••• •• ${formatted.slice(-2)}` : "+380 •• ••• •• ••"
}

function AppMark() {
  return (
    <div className="flex items-center gap-2 font-semibold" aria-label="ОСЦПВ Плюс">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <span>ОСЦПВ+</span>
    </div>
  )
}

function Spinner() {
  return <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
}

function TopBar({ onBack, step }: { onBack: () => void; step?: "1 з 2" | "2 з 2" }) {
  return (
    <header className="flex min-h-12 items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="-ml-3 grid size-11 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
        aria-label="Назад"
      >
        <ArrowLeft className="size-5" />
      </button>
      <AppMark />
      <span className="min-w-11 text-right text-sm font-medium text-muted-foreground">{step}</span>
    </header>
  )
}

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex gap-2" aria-label={`Крок ${current} із 2`}>
      {[1, 2].map((step) => (
        <span key={step} className={cn("h-1.5 flex-1 rounded-full", step <= current ? "bg-primary" : "bg-muted")} />
      ))}
    </div>
  )
}

function Banner({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-foreground">{children}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="min-h-11 shrink-0 font-semibold text-destructive underline-offset-4 hover:underline">
          Повторити
        </button>
      )}
    </div>
  )
}

function BottomSheet({ type, onClose }: { type: Exclude<Sheet, null>; onClose: () => void }) {
  const content = {
    terms: {
      title: "Умови використання",
      body: "Коротка демонстраційна версія документа. У робочому продукті тут буде повний юридичний текст з датою редакції.",
    },
    privacy: {
      title: "Політика конфіденційності",
      body: "Ми використовуємо номер телефону для входу, сервісних повідомлень і керування полісом. Це демонстраційний текст прототипу.",
    },
    support: {
      title: "Потрібна допомога?",
      body: "Оберіть зручний спосіб зв’язку. Дії нижче є демонстраційними заглушками.",
    },
    accident: {
      title: "Допомога при ДТП",
      body: "Якщо є постраждалі — телефонуйте 112. Зафіксуйте місце події, пошкодження та дані учасників. Авторизація для цієї допомоги не потрібна.",
    },
    policies: {
      title: "Мої поліси",
      body: "У демо-профілі ще немає активних полісів. Після оформлення вони з’являться тут разом зі статусом і документами.",
    },
    vehicle: {
      title: "Дані автомобіля",
      body: "Наступний екран оформлення буде присвячений державному номеру та параметрам автомобіля. Для цього тесту реєстраційний сценарій уже завершено.",
    },
    policy: {
      title: "Оберіть поліс",
      body: "У демо-профілі немає чинного поліса. У робочому продукті тут з’явиться список полісів для звернення щодо ДТП.",
    },
  }[type]

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="sheet-title" className="w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl sm:p-6">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="sheet-title" className="text-xl font-semibold">{content.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.body}</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30" aria-label="Закрити">
            <X className="size-5" />
          </button>
        </div>
        {type === "support" && (
          <div className="mt-6 grid gap-3">
            <Button type="button" variant="secondary" className="h-12 justify-start" onClick={onClose}>
              <Phone className="size-5" /> Зателефонувати
            </Button>
            <Button type="button" variant="secondary" className="h-12 justify-start" onClick={onClose}>
              <MessageCircle className="size-5" /> Написати в чат
            </Button>
            <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Якщо менеджер недоступний, залиште заявку — ми зателефонуємо.</p>
          </div>
        )}
        {type === "accident" && (
          <div className="mt-6 grid gap-3">
            <Button type="button" className="h-12" onClick={onClose}>Зрозуміло</Button>
            <Button type="button" variant="secondary" className="h-12" onClick={onClose}>Відкрити екстрені контакти</Button>
          </div>
        )}
        {type !== "support" && type !== "accident" && <Button type="button" className="mt-6 h-12 w-full" onClick={onClose}>Закрити</Button>}
      </section>
    </div>
  )
}

function DemoPanel({ intent, failure, onIntent, onFailure, onPrefill, onLogin }: {
  intent: Intent
  failure: RequestStage | null
  onIntent: (intent: Intent) => void
  onFailure: (stage: RequestStage | null) => void
  onPrefill: (kind: "new" | "existing") => void
  onLogin: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <aside className="fixed right-3 bottom-3 z-40 max-w-[calc(100%-1.5rem)] text-xs">
      <button type="button" onClick={() => setOpen(!open)} className="ml-auto block min-h-11 rounded-full border bg-card px-4 font-semibold shadow-lg">
        Demo controls
      </button>
      {open && (
        <div className="mt-2 w-72 rounded-2xl border bg-card p-4 shadow-xl">
          <p className="font-semibold">Тестовий сценарій</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onPrefill("new")} className="min-h-11 rounded-lg bg-muted px-2">Новий клієнт</button>
            <button type="button" onClick={() => onPrefill("existing")} className="min-h-11 rounded-lg bg-muted px-2">Існуючий</button>
          </div>
          <button type="button" onClick={onLogin} className="mt-2 min-h-11 w-full rounded-lg bg-primary px-3 font-semibold text-primary-foreground">Login / сесія завершилась</button>
          <p className="mt-4 font-semibold">Контекст повернення</p>
          <select value={intent} onChange={(e) => onIntent(e.target.value as Intent)} className="mt-2 h-11 w-full rounded-lg border bg-background px-3">
            <option value="home">Home</option>
            <option value="purchase">Оформлення</option>
            <option value="policy">Конкретний поліс</option>
            <option value="case">Статус звернення</option>
            <option value="accident">ДТП</option>
            <option value="unavailable">Недоступний deep link</option>
          </select>
          <p className="mt-4 font-semibold">Наступна мережева помилка</p>
          <select value={failure ?? "none"} onChange={(e) => onFailure(e.target.value === "none" ? null : e.target.value as RequestStage)} className="mt-2 h-11 w-full rounded-lg border bg-background px-3">
            <option value="none">Вимкнено</option>
            <option value="phone">Надсилання SMS</option>
            <option value="otp">Перевірка OTP</option>
            <option value="profile">Створення профілю</option>
          </select>
        </div>
      )}
    </aside>
  )
}

export function App() {
  const [screen, setScreen] = useState<Screen>("guest")
  const [intent, setIntent] = useState<Intent>("home")
  const [authMode, setAuthMode] = useState<AuthMode>("register")
  const [recoveryReturn, setRecoveryReturn] = useState<Screen>("loginRequired")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [expired, setExpired] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [loading, setLoading] = useState(false)
  const [requiredConsent, setRequiredConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [networkFailure, setNetworkFailure] = useState<RequestStage | null>(null)
  const [banner, setBanner] = useState("")
  const [sheet, setSheet] = useState<Sheet>(null)
  const [confirmation, setConfirmation] = useState<"new" | "existing">("new")
  const [callbackPhone, setCallbackPhone] = useState("")
  const [callbackTime, setCallbackTime] = useState("10:00–13:00")
  const [draftStep, setDraftStep] = useState<number | null>(null)
  const otpRef = useRef<HTMLInputElement>(null)

  const isExisting = phone === EXISTING_PHONE

  useEffect(() => {
    if (screen !== "otp" || seconds <= 0) return
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [screen, seconds])

  useEffect(() => {
    if (screen === "otp") window.setTimeout(() => otpRef.current?.focus(), 50)
  }, [screen])

  function start(targetIntent: Intent) {
    setAuthMode("register")
    setIntent(targetIntent)
    setScreen("phone")
    setBanner("")
  }

  function startLogin() {
    setAuthMode("login")
    setScreen("loginRequired")
    setBanner("")
  }

  function openRecovery(from: Screen) {
    setRecoveryReturn(from)
    setScreen("recovery")
    setBanner("")
  }

  function submitPhone() {
    if (phone.length !== 9) {
      setPhoneError("Введіть номер у форматі 67 123 45 67")
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (networkFailure === "phone") {
        setBanner("Немає з’єднання з інтернетом")
        setNetworkFailure(null)
        return
      }
      setBanner("")
      setOtp("")
      setOtpError("")
      setExpired(false)
      setSeconds(30)
      setScreen("otp")
    }, 500)
  }

  function verifyOtp(value = otp) {
    if (value.length !== 6 || loading) return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (networkFailure === "otp") {
        setBanner("Не вдалося перевірити код. Перевірте з’єднання і повторіть")
        setNetworkFailure(null)
        return
      }
      if (value === "000000") {
        setOtp("")
        setOtpError("Код не підходить. Перевірте SMS і спробуйте ще раз")
        otpRef.current?.focus()
        return
      }
      if (value === "999999") {
        setExpired(true)
        setOtpError("Термін дії коду завершився")
        return
      }
      if (value !== "123456") {
        setOtp("")
        setOtpError("Код не підходить. Для демо використайте 123456")
        otpRef.current?.focus()
        return
      }
      setBanner("")
      setOtpError("")
      if (authMode === "login" || isExisting) finish("existing")
      else setScreen("consent")
    }, 600)
  }

  function resend() {
    setOtp("")
    setOtpError("")
    setExpired(false)
    setSeconds(30)
    setBanner("Новий код надіслано")
    window.setTimeout(() => setBanner(""), 2200)
    window.setTimeout(() => otpRef.current?.focus(), 50)
  }

  function createProfile() {
    if (!requiredConsent) return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (networkFailure === "profile") {
        setBanner("Не вдалося створити профіль. Перевірте з’єднання та спробуйте ще раз")
        setNetworkFailure(null)
        return
      }
      finish("new")
    }, 600)
  }

  function finish(kind: "new" | "existing") {
    setConfirmation(kind)
    setScreen("confirmation")
    window.setTimeout(() => setScreen("destination"), 1200)
  }

  function goBack() {
    setBanner("")
    if (screen === "phone") setScreen(authMode === "login" ? "loginRequired" : "guest")
    if (screen === "otp") setScreen("phone")
    if (screen === "consent") setScreen("otp")
    if (screen === "recovery") setScreen(recoveryReturn)
    if (screen === "callback") setScreen("recovery")
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background text-foreground sm:bg-muted sm:p-6">
      <section className="relative flex h-svh min-h-0 w-full max-w-[375px] flex-col overflow-hidden bg-background sm:h-[812px] sm:rounded-[28px] sm:border sm:shadow-sm">
        {screen === "guest" && (
          <div className="flex min-h-full flex-1 flex-col p-6 sm:p-8">
            <AppMark />
            <div className="my-auto py-12">
              <div className="mb-8 grid size-20 place-items-center rounded-3xl bg-accent text-accent-foreground">
                <Car className="size-10" aria-hidden="true" />
              </div>
              <h1 className="max-w-xs text-3xl font-semibold leading-tight">ОСЦПВ у вашому смартфоні</h1>
              <p className="mt-4 max-w-sm text-base leading-6 text-muted-foreground">Оформлюйте, зберігайте та керуйте полісом онлайн</p>
            </div>
            <div className="grid gap-3">
              <Button className="h-12 w-full" onClick={() => start("home")}>Увійти або створити акаунт</Button>
              <Button variant="secondary" className="h-12 w-full" onClick={() => start("purchase")}><FileText className="size-5" /> Оформити ОСЦПВ</Button>
              <button type="button" onClick={() => setSheet("accident")} className="flex min-h-12 items-center justify-center gap-2 rounded-xl font-semibold text-destructive hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/20">
                <AlertCircle className="size-5" /> Допомога при ДТП
              </button>
            </div>
            <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
              <button type="button" className="min-h-11 underline" onClick={() => setSheet("terms")}>Умови використання</button>
              <button type="button" className="min-h-11 underline" onClick={() => setSheet("privacy")}>Політика конфіденційності</button>
            </div>
          </div>
        )}

        {screen === "loginRequired" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={() => setScreen("guest")} />
            <div className="my-auto py-8">
              <span className="grid size-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <ShieldCheck className="size-8" aria-hidden="true" />
              </span>
              <h1 className="mt-7 text-2xl font-semibold">Підтвердьте номер телефону</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Щоб захистити дані за полісами та зверненнями, увійдіть за номером телефону</p>
            </div>
            <div className="grid gap-2">
              <Button className="h-12 w-full" onClick={() => setScreen("phone")}>Увійти за номером</Button>
              <button type="button" onClick={() => setScreen("guest")} className="min-h-11 font-semibold">Повернутися</button>
              <button type="button" onClick={() => openRecovery("loginRequired")} className="min-h-11 font-semibold text-primary">Немає доступу до номера?</button>
            </div>
          </div>
        )}

        {screen === "phone" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={goBack} step="1 з 2" />
            <StepDots current={1} />
            <div className="mt-8">
              <h1 className="text-2xl font-semibold">Введіть номер телефону</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{authMode === "login" ? "Надішлемо SMS-код для безпечного входу" : "Надішлемо SMS-код для входу або створення акаунта"}</p>
            </div>
            {banner && <div className="mt-5"><Banner onRetry={submitPhone}>{banner}</Banner></div>}
            <div className="mt-8">
              <label htmlFor="phone" className="text-sm font-medium">Номер телефону</label>
              <div className={cn("mt-2 flex h-12 items-center rounded-xl border bg-card px-4 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20", phoneError && "border-destructive ring-3 ring-destructive/10")}>
                <Phone className="mr-3 size-5 text-muted-foreground" aria-hidden="true" />
                <span className="mr-2 text-sm font-medium">+380</span>
                <input id="phone" autoFocus inputMode="numeric" autoComplete="tel-national" value={formatPhone(phone)} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, "").slice(0, 9)); setPhoneError(""); setBanner("") }} onBlur={() => phone.length > 0 && phone.length < 9 && setPhoneError("Введіть номер у форматі 67 123 45 67")} placeholder="XX XXX XX XX" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" aria-invalid={!!phoneError} aria-describedby={phoneError ? "phone-error" : "phone-help"} />
              </div>
              <p id={phoneError ? "phone-error" : "phone-help"} role={phoneError ? "alert" : undefined} className={cn("mt-2 text-sm", phoneError ? "text-destructive" : "text-muted-foreground")}>
                {phoneError || "9 цифр після коду країни"}
              </p>
            </div>
            <div className="mt-5 grid justify-items-start">
              {authMode === "login" && <button type="button" onClick={() => openRecovery("phone")} className="min-h-11 font-semibold text-primary">Немає доступу до номера?</button>}
              <button type="button" onClick={() => setSheet("support")} className="min-h-11 font-semibold text-primary underline-offset-4 hover:underline">Потрібна допомога?</button>
            </div>
            <div className="mt-auto pt-8">
              <p className="mb-5 text-xs leading-5 text-muted-foreground">Продовжуючи, ви погоджуєтеся з <button type="button" onClick={() => setSheet("terms")} className="underline">Умовами використання</button> та <button type="button" onClick={() => setSheet("privacy")} className="underline">Політикою конфіденційності</button>.</p>
              <Button className="h-12 w-full" disabled={phone.length !== 9 || loading} onClick={submitPhone}>{loading ? <><Spinner /> Надсилаємо код</> : authMode === "login" ? "Отримати код" : "Продовжити"}</Button>
            </div>
          </div>
        )}

        {screen === "otp" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={goBack} step="2 з 2" />
            <StepDots current={2} />
            <div className="mt-8">
              <h1 className="text-2xl font-semibold">Введіть код із SMS</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Ми надіслали код на {maskedPhone(phone)}</p>
            </div>
            {banner && <div className="mt-5"><Banner onRetry={banner.includes("перевірити") ? () => verifyOtp() : undefined}>{banner}</Banner></div>}
            <div className="relative mt-8" onClick={() => otpRef.current?.focus()}>
              <label htmlFor="otp" className="sr-only">Шестизначний код із SMS</label>
              <input ref={otpRef} id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} disabled={loading || expired} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 6); setOtp(value); setOtpError(""); setBanner(""); if (value.length === 6) window.setTimeout(() => verifyOtp(value), 0) }} className="absolute inset-0 z-10 size-full cursor-text opacity-0" aria-invalid={!!otpError} aria-describedby="otp-message" />
              <div className="grid grid-cols-6 gap-2" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span key={index} className={cn("grid aspect-square place-items-center rounded-xl border bg-card text-xl font-semibold", index === otp.length && !expired && "border-ring ring-3 ring-ring/20", otpError && "border-destructive", otp[index] && "border-foreground/30")}>
                    {otp[index] ? "•" : ""}
                  </span>
                ))}
              </div>
            </div>
            <div id="otp-message" role={otpError ? "alert" : "status"} className={cn("mt-4 min-h-12 rounded-xl p-3 text-sm", otpError ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
              {loading ? <span className="flex items-center gap-2"><Spinner /> Перевіряємо код</span> : otpError || (seconds > 0 ? <>Надіслати код повторно можна через <span className="font-mono tabular-nums">00:{String(seconds).padStart(2, "0")}</span></> : "Можна надіслати новий код")}
            </div>
            <div className="mt-4 grid gap-1">
              <button type="button" onClick={resend} disabled={seconds > 0 && !expired} className="min-h-11 text-left font-semibold text-primary disabled:text-muted-foreground">Надіслати код повторно</button>
              <button type="button" onClick={() => setScreen("phone")} className="min-h-11 text-left font-semibold">Змінити номер</button>
              {authMode === "login" && <button type="button" onClick={() => openRecovery("otp")} className="min-h-11 text-left font-semibold text-primary">Немає доступу до номера?</button>}
              <button type="button" onClick={() => setSheet("support")} className="min-h-11 text-left font-semibold text-primary">Потрібна допомога?</button>
            </div>
            <div className="mt-auto rounded-xl border border-dashed p-3 text-xs leading-5 text-muted-foreground">
              Демо: <b>123456</b> — успіх, <b>000000</b> — помилка, <b>999999</b> — прострочено.
            </div>
          </div>
        )}

        {screen === "consent" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={goBack} />
            <div className="mt-8">
              <h1 className="text-2xl font-semibold">Кілька важливих умов</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Щоб створити профіль і оформлювати поліс, нам потрібна ваша згода</p>
            </div>
            {banner && <div className="mt-5"><Banner onRetry={createProfile}>{banner}</Banner></div>}
            <div className="mt-8 grid gap-4">
              <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
                <Checkbox checked={requiredConsent} onCheckedChange={(value) => setRequiredConsent(value === true)} className="mt-0.5" aria-label="Обов’язкова згода" />
                <span className="text-sm leading-6">Погоджуюся з <button type="button" onClick={(event) => { event.preventDefault(); setSheet("terms") }} className="font-semibold text-primary underline">Умовами використання</button> та <button type="button" onClick={(event) => { event.preventDefault(); setSheet("privacy") }} className="font-semibold text-primary underline">Політикою конфіденційності</button></span>
              </label>
              <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
                <Checkbox checked={marketingConsent} onCheckedChange={(value) => setMarketingConsent(value === true)} className="mt-0.5" aria-label="Маркетингова згода" />
                <span className="text-sm leading-6">Хочу отримувати персональні пропозиції та новини <span className="block text-xs text-muted-foreground">Необов’язково</span></span>
              </label>
            </div>
            <div className="mt-auto pt-8">
              <p className="mb-5 text-xs leading-5 text-muted-foreground">Сервісні повідомлення про поліс і звернення надсилатимемо незалежно від маркетингової згоди.</p>
              <Button className="h-12 w-full" disabled={!requiredConsent || loading} onClick={createProfile}>{loading ? <><Spinner /> Створюємо профіль</> : "Погоджуюсь і продовжую"}</Button>
            </div>
          </div>
        )}

        {screen === "recovery" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={goBack} />
            <div className="mt-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><Phone className="size-7" /></span>
              <h1 className="mt-6 text-2xl font-semibold">Немає доступу до номера?</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Щоб захистити ваші поліси та дані, зміну номера підтверджує менеджер</p>
              <p className="mt-5 rounded-xl bg-muted p-4 text-sm leading-6">Підготуйте дані, які допоможуть підтвердити вашу особу та поліс.</p>
            </div>
            <div className="mt-auto grid gap-3 pt-8">
              <Button className="h-12" onClick={() => setSheet("support")}>Зв’язатися з менеджером</Button>
              <Button variant="secondary" className="h-12" onClick={() => setScreen("callback")}>Залишити заявку на дзвінок</Button>
              <button type="button" onClick={() => setScreen(recoveryReturn)} className="min-h-11 font-semibold">Повернутися до входу</button>
              <button type="button" onClick={() => setSheet("accident")} className="min-h-11 font-semibold text-destructive">Допомога при ДТП</button>
            </div>
          </div>
        )}

        {screen === "callback" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <TopBar onBack={goBack} />
            <div className="mt-8">
              <h1 className="text-2xl font-semibold">Заявка на дзвінок</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Вкажіть номер, за яким менеджер зможе з вами зв’язатися</p>
            </div>
            <div className="mt-8 grid gap-5">
              <div>
                <label htmlFor="callback-phone" className="text-sm font-medium">Номер для зв’язку</label>
                <div className="mt-2 flex h-12 items-center rounded-xl border bg-card px-4 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                  <span className="mr-2 text-sm font-medium">+380</span>
                  <input id="callback-phone" inputMode="numeric" value={formatPhone(callbackPhone)} onChange={(event) => setCallbackPhone(event.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="XX XXX XX XX" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="callback-time" className="text-sm font-medium">Коли зручно поговорити</label>
                <select id="callback-time" value={callbackTime} onChange={(event) => setCallbackTime(event.target.value)} className="mt-2 h-12 w-full rounded-xl border bg-card px-4 text-sm">
                  <option>10:00–13:00</option>
                  <option>13:00–16:00</option>
                  <option>16:00–19:00</option>
                </select>
              </div>
            </div>
            <Button className="mt-auto h-12 w-full" disabled={callbackPhone.length !== 9} onClick={() => setScreen("callbackSuccess")}>Надіслати заявку</Button>
          </div>
        )}

        {screen === "callbackSuccess" && (
          <div className="grid flex-1 place-items-center p-8 text-center" role="status">
            <div>
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-10" /></span>
              <h1 className="mt-6 text-2xl font-semibold">Ми зв’яжемося з вами</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Менеджер зателефонує на +380 {formatPhone(callbackPhone)} у проміжку {callbackTime}.</p>
              <Button className="mt-8 h-12 w-full" onClick={() => setScreen("loginRequired")}>Повернутися до входу</Button>
            </div>
          </div>
        )}

        {screen === "confirmation" && (
          <div className="grid flex-1 place-items-center p-8 text-center" role="status" aria-live="polite">
            <div>
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-10" /></span>
              <h1 className="mt-6 text-2xl font-semibold">{confirmation === "new" ? "Номер підтверджено" : "Ви увійшли"}</h1>
              <p className="mt-3 text-sm text-muted-foreground">Повертаємо вас до потрібного розділу</p>
            </div>
          </div>
        )}

        {screen === "destination" && (
          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <header className="flex min-h-12 items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => intent === "home" ? setScreen("guest") : setIntent("home")}
                className="-ml-3 grid size-11 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
                aria-label="Назад"
              >
                <ArrowLeft className="size-5" />
              </button>
              <AppMark />
              <span className="size-11" aria-hidden="true" />
            </header>
            <span className="mt-5 self-start rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">Акаунт активний</span>
            {intent === "home" && (
              <div className="mt-7">
                <h1 className="text-2xl font-semibold">Вітаємо!</h1>
                <p className="mt-2 text-sm text-muted-foreground">Усе необхідне для вашого авто — в одному місці.</p>
                {draftStep && <button type="button" onClick={() => setScreen("application")} className="mt-6 w-full rounded-2xl border border-primary/30 bg-accent p-4 text-left"><span className="text-xs font-semibold text-primary">Чернетка збережена</span><b className="mt-1 block">Продовжити оформлення</b><span className="mt-1 block text-sm text-muted-foreground">Крок {draftStep} із 6</span></button>}
                <div className="mt-8 grid gap-3">
                  {[{icon:FileText,title:"Оформити ОСЦПВ",copy:"Новий поліс онлайн",action:() => { setDraftStep(null); setScreen("application") }},{icon:ShieldCheck,title:"Мої поліси",copy:"Документи та статус",action:() => setSheet("policies")},{icon:AlertCircle,title:"Допомога при ДТП",copy:"Екстрений сценарій",action:() => setSheet("accident")}].map(({icon:Icon,title,copy,action}) => (
                    <button key={title} type="button" onClick={action} className="flex min-h-20 items-center gap-4 rounded-2xl border bg-card p-4 text-left hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30">
                      <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span><span className="flex-1"><b className="block">{title}</b><span className="mt-1 block text-sm text-muted-foreground">{copy}</span></span><ChevronRight className="size-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {intent === "purchase" && (
              <div className="mt-7">
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><FileText className="size-7" /></span>
                <h1 className="mt-6 text-2xl font-semibold">Продовжимо оформлення</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Ми зберегли ваш прогрес. Наступний крок — дані автомобіля.</p>
                <div className="mt-8 rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">Крок 2 з 5</p><p className="mt-2 font-semibold">Інформація про транспортний засіб</p><div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 w-2/5 rounded-full bg-primary" /></div></div>
                <Button className="mt-6 h-12 w-full" onClick={() => setScreen("application")}>Продовжити оформлення</Button>
              </div>
            )}
            {intent === "policy" && (
              <div className="mt-7">
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><ShieldCheck className="size-7" /></span>
                <h1 className="mt-6 text-2xl font-semibold">Поліс ОСЦПВ</h1>
                <p className="mt-2 text-sm text-muted-foreground">Відкрито саме той поліс, який ви хотіли переглянути.</p>
                <div className="mt-7 rounded-2xl border bg-card p-5">
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Чинний</span>
                  <p className="mt-4 text-lg font-semibold">АА 1234 ВВ</p>
                  <p className="mt-1 text-sm text-muted-foreground">Діє до 02.10.2027</p>
                </div>
                <Button className="mt-5 h-12 w-full" onClick={() => setSheet("policy")}>Переглянути документ</Button>
              </div>
            )}
            {intent === "case" && (
              <div className="mt-7">
                <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><MessageCircle className="size-7" /></span>
                <h1 className="mt-6 text-2xl font-semibold">Статус звернення</h1>
                <p className="mt-2 text-sm text-muted-foreground">Звернення №4821 знайдено та відкрито після входу.</p>
                <div className="mt-7 rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">Поточний статус</p><p className="mt-2 font-semibold">Документи перевіряє менеджер</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Ми повідомимо, щойно статус зміниться.</p></div>
                <Button variant="secondary" className="mt-5 h-12 w-full" onClick={() => setSheet("support")}>Підтримка</Button>
              </div>
            )}
            {intent === "accident" && (
              <div className="mt-7">
                <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive"><AlertCircle className="size-7" /></span>
                <h1 className="mt-6 text-2xl font-semibold">Допомога при ДТП</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Авторизацію завершено. Оберіть чинний поліс або відкрийте покрокову інструкцію.</p>
                <Button className="mt-8 h-12 w-full" onClick={() => setSheet("accident")}>Відкрити інструкцію</Button>
                <Button variant="secondary" className="mt-3 h-12 w-full" onClick={() => setSheet("policy")}>Обрати чинний поліс</Button>
              </div>
            )}
            {intent === "unavailable" && (
              <div className="my-auto text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground"><AlertCircle className="size-8" /></span>
                <h1 className="mt-6 text-2xl font-semibold">Цей матеріал більше недоступний</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Можливо, посилання застаріло або матеріал було переміщено.</p>
                <Button className="mt-8 h-12 w-full" onClick={() => setIntent("home")}>До моїх полісів</Button>
                <Button variant="secondary" className="mt-3 h-12 w-full" onClick={() => setSheet("support")}>Підтримка</Button>
              </div>
            )}
            <button type="button" onClick={() => { setScreen("guest"); setPhone(""); setOtp(""); setRequiredConsent(false); setMarketingConsent(false) }} className="mt-auto min-h-11 text-sm font-semibold text-muted-foreground">Завершити демо</button>
          </div>
        )}

        {screen === "application" && (
          <ApplicationFlow
            initialStep={draftStep ?? 1}
            onSupport={() => setSheet("support")}
            onExit={(step, saved) => { setDraftStep(saved ? step : null); setIntent("home"); setScreen("destination") }}
            onComplete={() => { setDraftStep(null); setIntent("home"); setScreen("destination") }}
          />
        )}
      </section>

      <DemoPanel
        intent={intent}
        failure={networkFailure}
        onIntent={setIntent}
        onFailure={setNetworkFailure}
        onPrefill={(kind) => { setAuthMode("register"); setPhone(kind === "new" ? NEW_PHONE : EXISTING_PHONE); setScreen("phone") }}
        onLogin={startLogin}
      />
      {sheet && <BottomSheet type={sheet} onClose={() => setSheet(null)} />}
    </main>
  )
}

export default App
