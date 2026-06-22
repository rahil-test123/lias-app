import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FlaskConical, CheckCircle, ArrowRight, User, Mail, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { soumettreDemande } from '../../api/adhesions'

const BG     = '#1C1917'
const BG2    = '#141210'
const ACCENT = '#C2410C'
const WHITE  = '#FAFAF8'
const MUTED  = 'rgba(250,250,248,.38)'
const BORDER = 'rgba(250,250,248,.10)'

function fieldStyle(hasError) {
  return {
    width: '100%', padding: '11px 14px 11px 40px',
    background: 'rgba(250,250,248,.05)',
    border: `1.5px solid ${hasError ? '#EF4444' : BORDER}`,
    borderRadius: 8, color: WHITE,
    fontSize: '.875rem', fontFamily: 'var(--font-mono)',
    outline: 'none', transition: 'border-color .15s, box-shadow .15s',
  }
}

const onFocus = (e) => {
  e.target.style.borderColor = ACCENT
  e.target.style.boxShadow   = 'rgba(194,65,12,.18) 0 0 0 3px'
}
const onBlur = (e, err) => {
  e.target.style.borderColor = err ? '#EF4444' : BORDER
  e.target.style.boxShadow   = 'none'
}

function FieldIcon({ icon: Icon }) {
  return (
    <Icon
      size={14}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
      style={{ color: MUTED }}
    />
  )
}

export default function RejoindreePage() {
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await soumettreDemande(data)
      setSuccess(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la soumission')
    }
  }

  /* ── Succès ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: BG }}>
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: BG2,
            border: `1px solid ${BORDER}`,
            animation: 'slideUp .4s ease both',
          }}
        >
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, var(--success), transparent)` }} />
          <div className="px-8 py-10 text-center">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(21,128,61,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle size={32} style={{ color: '#34D399' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: WHITE, letterSpacing: '-.02em', marginBottom: '.75rem' }}>
              Demande envoyée !
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.84rem', color: MUTED, lineHeight: 1.65, marginBottom: '2rem' }}>
              Votre demande d'adhésion a été soumise avec succès.<br />
              Le directeur du laboratoire l'examinera et vous contactera par email.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 w-full justify-center py-3 rounded-xl font-semibold text-sm"
              style={{ background: ACCENT, color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
            >
              Retour à la connexion <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Formulaire ── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: BG }}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: BG2,
          border: `1px solid ${BORDER}`,
          animation: 'slideUp .4s ease both',
        }}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

        <div className="px-8 pt-8 pb-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <div style={{
              width: 48, height: 48, background: ACCENT, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
            }}>
              <FlaskConical size={22} color="#fff" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: WHITE, letterSpacing: '-.02em' }}>
              Rejoindre le LIAS
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.70rem', color: MUTED, marginTop: '.4rem', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center' }}>
              Laboratoire d'Informatique &amp; Applications
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'prenom', label: 'Prénom', ph: 'Votre prénom' },
                { key: 'nom',    label: 'Nom',    ph: 'Votre nom' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: MUTED, marginBottom: 6 }}>
                    {label}
                  </label>
                  <div className="relative">
                    <FieldIcon icon={User} />
                    <input
                      className="outline-none"
                      placeholder={ph}
                      style={fieldStyle(!!errors[key])}
                      onFocus={onFocus}
                      onBlur={e => onBlur(e, !!errors[key])}
                      {...register(key, { required: 'Obligatoire' })}
                    />
                  </div>
                  {errors[key] && <p style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5', fontSize: '.70rem', marginTop: 3 }}>{errors[key].message}</p>}
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: MUTED, marginBottom: 6 }}>
                Email professionnel / universitaire
              </label>
              <div className="relative">
                <FieldIcon icon={Mail} />
                <input
                  type="email"
                  className="outline-none"
                  placeholder="nom@universite.dz"
                  style={fieldStyle(!!errors.email)}
                  onFocus={onFocus}
                  onBlur={e => onBlur(e, !!errors.email)}
                  {...register('email', {
                    required: 'Email obligatoire',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' },
                  })}
                />
              </div>
              {errors.email && <p style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5', fontSize: '.70rem', marginTop: 3 }}>{errors.email.message}</p>}
            </div>

            {/* Motivation */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: MUTED, marginBottom: 6 }}>
                Motivation
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-3.5 pointer-events-none" style={{ color: MUTED }} />
                <textarea
                  rows={4}
                  className="outline-none resize-none"
                  placeholder="Présentez-vous brièvement et expliquez pourquoi vous souhaitez rejoindre le laboratoire…"
                  style={{ ...fieldStyle(!!errors.motivation), padding: '11px 14px 11px 40px' }}
                  onFocus={onFocus}
                  onBlur={e => onBlur(e, !!errors.motivation)}
                  {...register('motivation', {
                    required: 'Veuillez décrire votre motivation',
                    minLength: { value: 20, message: 'Minimum 20 caractères' },
                  })}
                />
              </div>
              {errors.motivation && <p style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5', fontSize: '.70rem', marginTop: 3 }}>{errors.motivation.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
              style={{
                padding: '11px 20px', marginTop: '.5rem',
                background: isSubmitting ? 'rgba(194,65,12,.55)' : ACCENT,
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: '.875rem', fontFamily: 'var(--font-sans)', fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#9A3410' }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = ACCENT }}
            >
              {isSubmitting ? 'Envoi en cours…' : <>Soumettre ma demande <ArrowRight size={14} /></>}
            </button>
          </form>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.80rem', color: MUTED, textAlign: 'center', marginTop: '1.25rem' }}>
            Déjà membre ?{' '}
            <Link to="/login" style={{ color: ACCENT, fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
