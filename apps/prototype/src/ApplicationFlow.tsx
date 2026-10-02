import { useState } from "react"
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  LoaderCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type LookupState = "idle" | "loading" | "found" | "notFound" | "offline"
type UploadState = "empty" | "uploading" | "added" | "unclear"

type Props = {
  initialStep?: number
  onExit: (step: number, saved: boolean) => void
  onComplete: () => void
  onSupport: () => void
}

const stepNames = ["Початок", "Автомобіль", "Перевірка авто", "Страхувальник", "Пропозиція", "Документи"]

function Field({ label, value, onChange, type = "text", readOnly = false, error, placeholder }: {
  label: string
  value: string
  onChange?: (value: string) => void
  type?: string
  readOnly?: boolean
  error?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn("mt-2 h-12 w-full rounded-xl border bg-card px-4 text-base outline-none focus:border-ring focus:ring-3 focus:ring-ring/20", error && "border-destructive", readOnly && "bg-muted text-muted-foreground")}
          aria-invalid={!!error}
        />
      </label>
      {error && <p role="alert" className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  )
}

function FlowHeader({ step, onBack, onClose, onHelp }: { step: number; onBack: () => void; onClose: () => void; onHelp: () => void }) {
  return (
    <>
      <header className="flex min-h-11 items-center justify-between">
        <button type="button" onClick={onBack} className="grid size-11 place-items-center rounded-full hover:bg-muted" aria-label="Назад"><ArrowLeft className="size-5" /></button>
        <span className="text-sm font-semibold">Оформити ОСЦПВ</span>
        <div className="flex">
          <button type="button" onClick={onHelp} className="grid size-11 place-items-center rounded-full hover:bg-muted" aria-label="Допомога"><CircleHelp className="size-5" /></button>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full hover:bg-muted" aria-label="Закрити оформлення"><X className="size-5" /></button>
        </div>
      </header>
      <div className="mt-3" aria-label={`Крок ${step} із 6, ${stepNames[step - 1]}`}>
        <div className="flex items-center justify-between text-xs"><span className="font-semibold">Крок {step} із 6</span><span className="text-muted-foreground">{stepNames[step - 1]}</span></div>
        <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${step / 6 * 100}%` }} /></div>
      </div>
    </>
  )
}

export function ApplicationFlow({ initialStep = 1, onExit, onComplete, onSupport }: Props) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), 6))
  const [date, setDate] = useState("2026-10-05")
  const [plate, setPlate] = useState("AA 1234 BB")
  const [lookup, setLookup] = useState<LookupState>(initialStep > 2 ? "found" : "idle")
  const [manual, setManual] = useState(false)
  const [make, setMake] = useState("Toyota")
  const [model, setModel] = useState("Corolla")
  const [year, setYear] = useState("2020")
  const [city, setCity] = useState("Київ")
  const [firstName, setFirstName] = useState("Олександр")
  const [lastName, setLastName] = useState("Коваль")
  const [birthDate, setBirthDate] = useState("1990-04-12")
  const [taxId, setTaxId] = useState("1234567890")
  const [email, setEmail] = useState("oleksandr@example.com")
  const [owner, setOwner] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [offerExpanded, setOfferExpanded] = useState(false)
  const [offerUpdated, setOfferUpdated] = useState(false)
  const [upload, setUpload] = useState<UploadState>("empty")
  const [sheet, setSheet] = useState<"exit" | "upload" | "preview" | "delete" | "submitted" | null>(null)
  const [toast, setToast] = useState("")

  const normalizePlate = (value: string) => value.toUpperCase().replace(/[^A-ZА-ЯІЇЄ0-9]/g, "").slice(0, 8).replace(/^(.{2})(.{0,4})(.{0,2}).*$/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "))
  const plateReady = plate.replace(/\s/g, "").length === 8

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2200)
  }

  function back() {
    if (step === 1) onExit(1, true)
    else setStep((value) => value - 1)
  }

  function searchVehicle() {
    setLookup("loading")
    window.setTimeout(() => {
      const compact = plate.replace(/\s/g, "")
      if (compact === "AA0000AA") setLookup("notFound")
      else if (compact === "AA9999AA") setLookup("offline")
      else { setLookup("found"); setManual(false); setStep(3) }
    }, 600)
  }

  function manualContinue() {
    const next: Record<string, string> = {}
    if (!plateReady) next.plate = "Перевірте формат номерного знака"
    if (!make.trim()) next.make = "Оберіть або введіть марку"
    if (!model.trim()) next.model = "Оберіть або введіть модель"
    if (!year || Number(year) > 2026 || Number(year) < 1950) next.year = "Введіть коректний рік випуску"
    setErrors(next)
    if (!Object.keys(next).length) setStep(4)
  }

  function policyholderContinue() {
    const next: Record<string, string> = {}
    if (!firstName.trim()) next.firstName = "Введіть ім’я"
    if (!lastName.trim()) next.lastName = "Введіть прізвище"
    if (!/^\d{10}$/.test(taxId)) next.taxId = "Перевірте введені цифри"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Введіть email у форматі name@example.com"
    setErrors(next)
    if (!Object.keys(next).length) setStep(5)
  }

  function addFile(kind: "camera" | "files") {
    if (kind === "camera") {
      setUpload("unclear")
      setSheet(null)
      return
    }
    setUpload("uploading")
    setSheet(null)
    window.setTimeout(() => { setUpload("added"); showToast("Документ додано") }, 700)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pt-3"><FlowHeader step={step} onBack={back} onClose={() => setSheet("exit")} onHelp={onSupport} /></div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-6">
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold">Оформимо ОСЦПВ онлайн</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Внесіть дані авто та страхувальника — покажемо вартість до оплати</p>
            <div className="mt-6 grid gap-3 rounded-2xl bg-muted p-4 text-sm">
              {["Дані автомобіля", "Дані страхувальника", "Документи"].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 className="size-5 text-primary" />{item}</div>)}
            </div>
            <div className="mt-7"><Field label="Коли має почати діяти поліс?" type="date" value={date} onChange={setDate} /><p className="mt-2 text-xs text-muted-foreground">Остаточний строк дії побачите перед підтвердженням</p></div>
            <button type="button" onClick={onSupport} className="mt-5 min-h-11 font-semibold text-primary">Маєте питання? Зв’язатися з менеджером</button>
            <Button className="mt-6 h-12 w-full" onClick={() => setStep(2)}>Продовжити</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold">Знайдемо ваш автомобіль</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Введіть державний номер — ми підкажемо дані авто</p>
            <div className="mt-7"><Field label="Державний номер" value={plate} onChange={(value) => { setPlate(normalizePlate(value)); setLookup("idle") }} placeholder="AA 1234 BB" error={!plateReady && plate.length > 0 ? "Перевірте формат номерного знака" : undefined} /></div>
            <button type="button" onClick={() => showToast("Номер вказаний на номерному знаку та в документі на авто")} className="min-h-11 text-sm font-semibold text-primary">Де знайти номер?</button>
            {lookup === "notFound" && <div className="mt-4 rounded-xl bg-muted p-4"><p className="font-semibold">Не знайшли автомобіль</p><p className="mt-1 text-sm text-muted-foreground">Введіть дані вручну або спробуйте інший номер.</p></div>}
            {lookup === "offline" && <div role="alert" className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm"><b>Не вдалося перевірити авто.</b><p className="mt-1">Дані можна ввести вручну.</p><button type="button" onClick={searchVehicle} className="mt-3 min-h-11 font-semibold text-destructive">Спробувати ще</button></div>}
            <div className="mt-6 grid gap-3">
              <Button className="h-12" disabled={!plateReady || lookup === "loading"} onClick={searchVehicle}>{lookup === "loading" ? <><LoaderCircle className="size-5 animate-spin" /> Шукаємо</> : "Знайти автомобіль"}</Button>
              <div className="text-center text-xs text-muted-foreground">або</div>
              <Button variant="secondary" className="h-12" disabled={lookup === "loading"} onClick={() => { setManual(true); setStep(3) }}>Ввести дані вручну</Button>
            </div>
            <p className="mt-6 text-xs leading-5 text-muted-foreground">Перевіряємо лише дані, потрібні для розрахунку</p>
          </div>
        )}

        {step === 3 && !manual && (
          <div>
            <h1 className="text-2xl font-semibold">Це ваш автомобіль?</h1>
            <p className="mt-3 text-sm text-muted-foreground">Ми знайшли дані за номером {plate}</p>
            <div className="mt-6 rounded-2xl border bg-card p-5">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Дані знайдено автоматично</span>
              <dl className="mt-5 grid gap-3 text-sm">{[["Номер", plate],["Марка і модель", `${make} ${model}`],["Рік", year],["Тип", "Легковий автомобіль"],["Реєстрація", city]].map(([key,value]) => <div key={key} className="flex justify-between gap-4"><dt className="text-muted-foreground">{key}</dt><dd className="text-right font-semibold">{value}</dd></div>)}</dl>
            </div>
            <p className="mt-4 rounded-xl bg-muted p-3 text-sm">Перевірте дані: від них залежить розрахунок</p>
            <div className="mt-6 grid gap-3"><Button className="h-12" onClick={() => setStep(4)}>Так, усе правильно</Button><Button variant="secondary" className="h-12" onClick={() => setManual(true)}>Виправити дані</Button><button type="button" onClick={() => { setPlate(""); setStep(2) }} className="min-h-11 font-semibold">Це інше авто</button></div>
          </div>
        )}

        {step === 3 && manual && (
          <div>
            <h1 className="text-2xl font-semibold">Дані автомобіля</h1>
            <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{lookup === "found" ? "Відредагуйте неточні дані" : "Заповніть дані вручну"}</p>
            <div className="mt-5 grid gap-4">
              <Field label="Державний номер" value={plate} onChange={(value) => setPlate(normalizePlate(value))} error={errors.plate} />
              <Field label="Марка" value={make} onChange={setMake} error={errors.make} />
              <Field label="Модель" value={model} onChange={setModel} error={errors.model} />
              <Field label="Рік випуску" type="number" value={year} onChange={setYear} error={errors.year} />
              <label className="text-sm font-medium">Тип транспортного засобу<select className="mt-2 h-12 w-full rounded-xl border bg-card px-4"><option>Легковий автомобіль</option></select></label>
              <Field label="Місто реєстрації" value={city} onChange={setCity} />
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Деякі дані можуть попросити підтвердити документом на наступному кроці</p>
            <Button className="mt-6 h-12 w-full" onClick={manualContinue}>Продовжити</Button>
            <button type="button" onClick={() => setStep(2)} className="mt-2 min-h-11 w-full font-semibold">Спробувати знайти за номером ще раз</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-semibold">Хто оформлює поліс?</h1>
            <p className="mt-3 text-sm text-muted-foreground">Перевірте дані — вони будуть у договорі</p>
            <div className="mt-5 rounded-xl bg-muted p-4 text-sm"><b>Дані з вашого профілю</b><p className="mt-1 text-muted-foreground">Їх можна змінити для цієї заявки</p></div>
            <div className="mt-5 grid gap-4">
              <Field label="Ім’я" value={firstName} onChange={setFirstName} error={errors.firstName} />
              <Field label="Прізвище" value={lastName} onChange={setLastName} error={errors.lastName} />
              <Field label="Дата народження" type="date" value={birthDate} onChange={setBirthDate} />
              <Field label="Ідентифікаційний номер" value={taxId} onChange={(value) => setTaxId(value.replace(/\D/g, "").slice(0, 10))} error={errors.taxId} />
              <Field label="Email для документів" type="email" value={email} onChange={setEmail} error={errors.email} />
              <Field label="Телефон" value="+380 67 123 45 11" readOnly />
              <button type="button" onClick={onSupport} className="-mt-3 min-h-11 text-left text-sm font-semibold text-primary">Змінити номер у профілі</button>
              <label className="flex min-h-14 items-start gap-3 rounded-xl border bg-card p-4"><Checkbox checked={owner} onCheckedChange={(value) => setOwner(value === true)} /><span className="text-sm font-medium">Я є власником автомобіля</span></label>
              {!owner && <p className="rounded-xl bg-muted p-3 text-sm">Дані власника уточнимо за документами на наступному кроці.</p>}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Зміни в цій заявці не змінять дані вашого профілю.</p>
            <Button className="mt-6 h-12 w-full" onClick={policyholderContinue}>Продовжити до пропозиції</Button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-semibold">Ваша пропозиція ОСЦПВ</h1>
            {offerUpdated && <p className="mt-4 rounded-xl bg-accent p-3 text-sm">Ми оновили пропозицію після зміни даних.</p>}
            <div className="mt-5 rounded-2xl bg-foreground p-5 text-background"><p className="text-sm opacity-75">Вартість поліса</p><p className="mt-2 text-3xl font-semibold">₴ 3 480</p><p className="mt-2 text-xs leading-5 opacity-75">Сума не зміниться після перевірки без вашого підтвердження</p></div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Період дії</p><p className="mt-1 font-semibold">{date} → 2027-10-04</p></div>
              <div className="rounded-xl border bg-card p-4"><div className="flex justify-between"><div><p className="text-xs text-muted-foreground">Автомобіль</p><p className="mt-1 font-semibold">{plate}, {make} {model}</p></div><button type="button" onClick={() => { setManual(true); setOfferUpdated(true); setStep(3) }} className="min-h-11 text-sm font-semibold text-primary">Змінити</button></div></div>
              <div className="rounded-xl border bg-card p-4"><div className="flex justify-between"><div><p className="text-xs text-muted-foreground">Страхувальник</p><p className="mt-1 font-semibold">{firstName} {lastName}</p><p className="text-sm text-muted-foreground">{email.replace(/(.{2}).+(@.+)/, "$1•••$2")}</p></div><button type="button" onClick={() => { setOfferUpdated(true); setStep(4) }} className="min-h-11 text-sm font-semibold text-primary">Змінити</button></div></div>
              <button type="button" onClick={() => setOfferExpanded(!offerExpanded)} className="flex min-h-12 items-center justify-between rounded-xl border bg-card px-4 text-left font-semibold">Що входить в ОСЦПВ <ChevronDown className={cn("size-5 transition", offerExpanded && "rotate-180")} /></button>
              {offerExpanded && <div className="rounded-xl bg-muted p-4 text-sm leading-6">Відшкодування шкоди життю, здоров’ю та майну третіх осіб у межах чинних умов страхування.</div>}
            </div>
            <p className="mt-4 rounded-xl bg-muted p-3 text-sm">Перед випуском перевіримо документи. Оплата буде на наступному кроці.</p>
            <Button className="mt-6 h-12 w-full" onClick={() => setStep(6)}>Продовжити</Button>
            <button type="button" onClick={() => onExit(5, true)} className="mt-2 min-h-11 w-full font-semibold">Зберегти й повернутися пізніше</button>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="text-2xl font-semibold">Додайте документи</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Це допоможе перевірити заявку та випустити поліс без зайвих уточнень</p>
            <div className="mt-6 rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3"><span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><FileText className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold">Документ на автомобіль</p><p className={cn("mt-1 text-sm", upload === "added" ? "text-success" : upload === "unclear" ? "text-destructive" : "text-muted-foreground")}>{upload === "empty" && "Не додано"}{upload === "uploading" && "Завантажується…"}{upload === "added" && "Додано · tech-passport.jpg"}{upload === "unclear" && "Потрібно замінити · не видно всіх даних"}</p></div></div>
              {upload === "uploading" && <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 animate-pulse rounded-full bg-primary" /></div>}
              {upload === "added" ? <div className="mt-4 flex gap-2"><Button variant="secondary" className="h-11 flex-1" onClick={() => setSheet("preview")}>Переглянути</Button><Button variant="secondary" className="h-11" onClick={() => setSheet("upload")}>Замінити</Button></div> : <Button variant="secondary" className="mt-4 h-11 w-full" onClick={() => setSheet("upload")}>{upload === "unclear" ? "Додати інший файл" : "Додати"}</Button>}
            </div>
            <div className="mt-3 rounded-2xl border border-dashed p-4"><p className="font-semibold">Додатковий документ</p><p className="mt-1 text-sm text-muted-foreground">За потреби</p></div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Фото має бути чітким, усі кути документа — у кадрі</p>
            <button type="button" onClick={onSupport} className="mt-2 min-h-11 font-semibold text-primary">Потрібна допомога з документами?</button>
            <Button className="mt-6 h-12 w-full" disabled={upload !== "added"} onClick={() => setSheet("submitted")}>Надіслати на перевірку</Button>
            <Button variant="secondary" className="mt-3 h-12 w-full" onClick={() => onExit(6, true)}>Зберегти й вийти</Button>
          </div>
        )}
      </div>

      {toast && <div role="status" className="absolute bottom-5 left-5 right-5 rounded-xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-background shadow-lg">{toast}</div>}

      {sheet && (
        <div className="absolute inset-0 z-30 flex items-end bg-foreground/40" onMouseDown={(event) => event.target === event.currentTarget && setSheet(null)}>
          <section role="dialog" aria-modal="true" className="w-full rounded-t-3xl bg-background p-5 shadow-xl">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
            {sheet === "exit" && <><h2 className="text-xl font-semibold">Чернетка вже збережена</h2><p className="mt-2 text-sm text-muted-foreground">Ви зможете продовжити з цього кроку пізніше.</p><div className="mt-6 grid gap-3"><Button className="h-12" onClick={() => onExit(step, true)}>Зберегти й вийти</Button><Button variant="secondary" className="h-12" onClick={() => setSheet(null)}>Продовжити оформлення</Button><button type="button" onClick={() => onExit(1, false)} className="min-h-11 font-semibold text-destructive">Видалити чернетку</button></div></>}
            {sheet === "upload" && <><h2 className="text-xl font-semibold">Додати документ на автомобіль</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Фото має бути чітким, без відблисків, з усіма кутами документа.</p><div className="mt-6 grid gap-3"><Button className="h-12" onClick={() => addFile("camera")}><Camera className="size-5" /> Зробити фото</Button><Button variant="secondary" className="h-12" onClick={() => addFile("files")}><Upload className="size-5" /> Вибрати з файлів</Button><button type="button" onClick={() => setSheet(null)} className="min-h-11 font-semibold">Скасувати</button></div><p className="mt-4 text-xs text-muted-foreground">JPG, PNG або PDF, до 10 МБ</p></>}
            {sheet === "preview" && <><h2 className="text-xl font-semibold">Документ на автомобіль</h2><div className="mt-5 grid h-44 place-items-center rounded-2xl bg-muted text-muted-foreground"><FileCheck2 className="size-14" /><span className="sr-only">Попередній перегляд документа</span></div><p className="mt-3 text-sm font-medium">tech-passport.jpg · 1,8 МБ</p><div className="mt-6 flex gap-3"><Button variant="secondary" className="h-12 flex-1" onClick={() => setSheet("upload")}>Замінити</Button><Button variant="secondary" className="h-12 text-destructive" onClick={() => setSheet("delete")}><Trash2 className="size-5" /> Видалити</Button></div></>}
            {sheet === "delete" && <><h2 className="text-xl font-semibold">Видалити цей документ?</h2><p className="mt-2 text-sm text-muted-foreground">Для надсилання заявки його потрібно буде додати знову.</p><div className="mt-6 grid gap-3"><Button className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { setUpload("empty"); setSheet(null) }}>Видалити</Button><Button variant="secondary" className="h-12" onClick={() => setSheet("preview")}>Скасувати</Button></div></>}
            {sheet === "submitted" && <div className="text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-8" /></span><h2 className="mt-5 text-xl font-semibold">Заявку надіслано</h2><p className="mt-2 text-sm text-muted-foreground">Ми перевіримо документи та повідомимо про наступний крок.</p><Button className="mt-6 h-12 w-full" onClick={onComplete}>Готово</Button></div>}
          </section>
        </div>
      )}
    </div>
  )
}
