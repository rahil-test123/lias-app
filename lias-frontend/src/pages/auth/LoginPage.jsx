import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      if (!err.response) {
        toast.error('Serveur inaccessible — le backend est-il démarré ?', { duration: 5000 })
      } else {
        toast.error(err.response?.data?.message || 'Email ou mot de passe incorrect')
      }
    }
  }

  /* tokens intégrés à la page sombre */
  const BG      = '#1C1917'   // sidebar-bg réutilisé
  const BG2     = '#141210'
  const ACCENT  = '#C2410C'
  const WHITE   = '#FAFAF8'
  const MUTED   = 'rgba(250,250,248,.38)'
  const BORDER  = 'rgba(250,250,248,.10)'

  return (
    <div className="min-h-screen flex" style={{ background: BG, fontFamily: 'var(--font-sans)' }}>

      {/* ── Panneau gauche — Identité ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 px-12 py-14"
        style={{ background: BG2, borderRight: `1px solid ${BORDER}` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, background: ACCENT, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: WHITE }}>LIAS</span>
        </div>

        {/* Citation */}
        <div>
          <div style={{ width: 32, height: 2, background: ACCENT, borderRadius: 2, marginBottom: '1.5rem' }} />
          <blockquote style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 600, color: WHITE, lineHeight: 1.3, letterSpacing: '-.02em' }}>
            "La recherche est la quête permanente de la vérité."
          </blockquote>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: MUTED, marginTop: '1.5rem', lineHeight: 1.6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Laboratoire d'Informatique &amp; Applications<br />
            Faculté des Sciences Ben M'Sik · Université Hassan II
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          {[['8+', 'Chercheurs'], ['4', 'Équipes'], ['20+', 'Publications']].map(([n, l]) => (
            <div key={l}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: WHITE, letterSpacing: '-.03em' }}>{n}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: MUTED, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — Formulaire ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]" style={{ animation: 'slideUp .4s cubic-bezier(.4,0,.2,1) both' }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div style={{ width: 32, height: 32, background: ACCENT, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: WHITE }}>LIAS</span>
          </div>

          {/* Titre */}
          <div className="mb-8">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.9rem', fontWeight: 700, color: WHITE, letterSpacing: '-.025em', lineHeight: 1.15 }}>
              Connexion
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.84rem', color: MUTED, marginTop: '.4rem' }}>
              Accès réservé aux membres du laboratoire
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: MUTED, marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                placeholder="prenom.nom@lias.dz"
                autoComplete="email"
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(250,250,248,.05)',
                  border: `1.5px solid ${errors.email ? '#EF4444' : BORDER}`,
                  borderRadius: 8, color: WHITE, fontSize: '.875rem',
                  fontFamily: 'var(--font-mono)', outline: 'none',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
                onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px rgba(194,65,12,.18)` }}
                onBlur={e => { e.target.style.borderColor = errors.email ? '#EF4444' : BORDER; e.target.style.boxShadow = 'none' }}
                {...register('email', { required: 'Email obligatoire' })}
              />
              {errors.email && <p style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5', fontSize: '.72rem', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: MUTED, marginBottom: 6 }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px',
                    background: 'rgba(250,250,248,.05)',
                    border: `1.5px solid ${errors.password ? '#EF4444' : BORDER}`,
                    borderRadius: 8, color: WHITE, fontSize: '.875rem',
                    fontFamily: 'var(--font-mono)', outline: 'none',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px rgba(194,65,12,.18)` }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#EF4444' : BORDER; e.target.style.boxShadow = 'none' }}
                  {...register('password', { required: 'Mot de passe obligatoire' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontFamily: 'var(--font-mono)', color: '#FCA5A5', fontSize: '.72rem', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
              style={{
                padding: '11px 20px',
                background: isSubmitting ? 'rgba(194,65,12,.55)' : ACCENT,
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: '.875rem', fontFamily: 'var(--font-sans)', fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background .15s, opacity .15s',
                marginTop: '0.5rem',
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#9A3410' }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = ACCENT }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                  Connexion…
                </>
              ) : (
                <>Se connecter <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '.80rem', color: MUTED, textAlign: 'center' }}>
              Pas encore membre ?{' '}
              <Link
                to="/rejoindre"
                style={{ color: ACCENT, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Soumettre une candidature
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
