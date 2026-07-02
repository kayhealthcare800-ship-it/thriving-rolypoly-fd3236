import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import {
  getExistingRegistrationForDevice,
  submitRegistration,
} from '@/server/registrations.functions'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  loader: async () => {
    const existing = await getExistingRegistrationForDevice({ data: undefined })
    return { existing }
  },
})

type FormState = {
  fullName: string
  email: string
  phone: string
  institution: string
}

const INSTITUTIONS = [
  'Obafemi Awolowo University',
  'Osun State University',
  'Lead City University',
  'University of Ibadan',
  'Federal University of Technology, Akure',
  'Other',
]

function RegisterPage() {
  const { existing } = Route.useLoaderData()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
  })
  const [selfie, setSelfie] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existing?.ticketRef) {
      navigate({ to: '/ticket/$ref', params: { ref: existing.ticketRef } })
    }
  }, [existing, navigate])

  async function handleSubmit() {
    if (!selfie) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await submitRegistration({
        data: { ...form, selfieDataUrl: selfie },
      })
      navigate({ to: '/ticket/$ref', params: { ref: result.ticketRef } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (existing?.ticketRef) {
    return null
  }

  return (
    <div className="min-h-screen bg-fg-cream">
      <Header />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[380px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <PassPreview name={form.fullName} step={step} selfie={selfie} />
        </div>

        <div className="overflow-hidden rounded-2xl border-t-4 border-fg-maroon bg-white shadow-xl">
          <div className="p-8 sm:p-10">
            <StepIndicator step={step} />

            {step === 1 ? (
              <ProfileStep
                form={form}
                setForm={setForm}
                onContinue={() => setStep(2)}
              />
            ) : (
              <FaceScanStep
                selfie={selfie}
                setSelfie={setSelfie}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                submitting={submitting}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
        <span className={step === 1 ? 'text-fg-maroon' : 'text-fg-ink/40'}>① Profile</span>
        <span className="text-fg-ink/30">&mdash;&mdash;&mdash;</span>
        <span className={step === 2 ? 'text-fg-maroon' : 'text-fg-ink/40'}>② Face Scan</span>
      </div>
      <a
        href="/retrieve"
        className="text-xs font-semibold uppercase tracking-wide text-fg-gold hover:text-fg-maroon"
      >
        Retrieve Pass &rarr;
      </a>
    </div>
  )
}

function ProfileStep({
  form,
  setForm,
  onContinue,
}: {
  form: FormState
  setForm: (f: FormState) => void
  onContinue: () => void
}) {
  const canContinue =
    form.fullName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim().length > 6 &&
    form.institution.trim().length > 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canContinue) onContinue()
      }}
    >
      <h1 className="font-serif text-2xl font-bold text-fg-maroon">Secure Seating Pass</h1>
      <p className="mt-1 text-sm text-fg-ink/60">
        Fill in your details to reserve a seat at the concert.
      </p>

      <div className="mt-6 space-y-5">
        <Field label="Full Name">
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="input"
            placeholder="e.g. Adaeze Femi-Johnson"
          />
        </Field>

        <Field label="Email Address" helper="Pass will be synced to this email.">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Phone Number" helper="Preferred WhatsApp line for pass notifications.">
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input"
            placeholder="0803 000 0000"
          />
        </Field>

        <Field label="Select Your Institution">
          <select
            required
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            className="input"
          >
            <option value="" disabled>
              Choose your institution
            </option>
            {INSTITUTIONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button
        type="submit"
        disabled={!canContinue}
        className="mt-8 w-full rounded-full bg-fg-maroon py-3.5 text-sm font-semibold uppercase tracking-wider text-fg-cream transition hover:bg-fg-maroon-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Face Capture &rarr;
      </button>
    </form>
  )
}

function Field({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-fg-ink/70">{label}</span>
      <div className="mt-1.5">{children}</div>
      {helper && <p className="mt-1 text-xs text-fg-ink/50">{helper}</p>}
    </label>
  )
}

function FaceScanStep({
  selfie,
  setSelfie,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  selfie: string | null
  setSelfie: (v: string | null) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  error: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Your browser doesn't support live camera capture. Use the upload option below instead.",
        )
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setCameraError(
          'Camera access was blocked or unavailable. Allow camera permission and retry, or upload a photo below.',
        )
      }
    }
    if (!selfie) {
      setCameraError(null)
      start()
    }
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [selfie, retryToken])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setSelfie(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setSelfie(dataUrl)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  function retake() {
    setSelfie(null)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-fg-maroon">Live Face Verification</h1>
      <p className="mt-1 text-sm text-fg-ink/60">
        Live snapshot is required to secure seating and prevent proxy reservations.
      </p>

      <div className="mt-5 flex gap-3 rounded-lg bg-gray-100 p-4 text-sm text-fg-ink/70">
        <span className="mt-0.5 shrink-0 text-amber-600" aria-hidden>
          <WarningIcon />
        </span>
        <p>
          <strong className="font-semibold text-fg-ink">Please Note:</strong> Ensure your face
          is clearly showing. If the photo is blur, dark, or not a real face, your ticket will
          be automatically deleted by the organizers.
        </p>
      </div>

      <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-black">
        {selfie ? (
          <img src={selfie} alt="Captured face scan" className="h-full w-full object-cover" />
        ) : cameraError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-white/70">
            <p>{cameraError}</p>
            <button
              type="button"
              onClick={() => setRetryToken((t) => t + 1)}
              className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-44 rounded-[45%] border-2 border-dashed border-white/70" />
            </div>
            <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Center your face in the box
            </span>
            <button
              type="button"
              onClick={capture}
              className="absolute bottom-5 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-white bg-white/30 shadow-lg transition hover:bg-white/50"
              aria-label="Capture photo"
            />
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {selfie && (
        <button
          type="button"
          onClick={retake}
          className="mt-3 text-xs font-semibold uppercase tracking-wide text-fg-maroon underline"
        >
          Retake Photo
        </button>
      )}

      {cameraError && !selfie && (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold uppercase tracking-wide text-fg-maroon underline"
          >
            Upload a Photo Instead
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!selfie || submitting}
        onClick={onSubmit}
        className="mt-6 w-full rounded-full bg-fg-maroon py-3.5 text-sm font-semibold uppercase tracking-wider text-fg-cream transition hover:bg-fg-maroon-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Generating Ticket…' : 'Generate Seating Ticket'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 block text-xs font-semibold uppercase tracking-wide text-fg-ink/60 hover:text-fg-maroon"
      >
        &larr; Back to Info Step
      </button>
    </div>
  )
}

function PassPreview({
  name,
  step,
  selfie,
}: {
  name: string
  step: 1 | 2
  selfie: string | null
}) {
  return (
    <div className="rounded-2xl border border-fg-gold/30 bg-white p-6 shadow-lg">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-ink/50">
        Live Pass Preview
      </p>

      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-fg-maroon to-fg-maroon-dark p-6 text-fg-cream">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-fg-gold/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-fg-gold-soft">
            Verified Pass
          </span>
          <span className="text-[10px] uppercase tracking-widest text-fg-cream/60">Event Pass</span>
        </div>

        <h2 className="mt-4 font-serif text-xl font-bold">Faithful God</h2>
        <p className="text-xs text-fg-cream/70">Gratitude Concert 2026</p>

        <div className="mt-6 flex items-center gap-4">
          {selfie ? (
            <img src={selfie} alt="Your captured selfie" className="h-16 w-16 rounded-full object-cover ring-2 ring-fg-gold" />
          ) : (
            <InitialsAvatar
              initials={step === 2 ? '…' : '?'}
              className="h-16 w-16 shrink-0 text-xl ring-2 ring-fg-gold/60"
            />
          )}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-fg-cream/50">Attendee</p>
            <p className="font-serif text-base font-semibold">
              {name.trim() || 'Your Name Here'}
            </p>
            <p className="text-[10px] text-fg-cream/50">Ref: FG-DRAFT</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-fg-cream/20 pt-3 text-[10px] text-fg-cream/60">
          <span>Amphitheatre, OAU</span>
          <span>Jul 17, 2026</span>
        </div>
      </div>
    </div>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 1 21h22L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <path d="M12 17.5h.01" strokeLinecap="round" />
    </svg>
  )
}
