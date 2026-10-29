// RULE II · "The Task Force" — experience. Every investigation needs a team; these
// are the ones Akram joined. A vertical timeline of case-file cards: role, place
// and dates on the left (the date stamped like a file label), details on the right.
import { useEffect, useLayoutEffect, useRef } from 'react'
import { roles, sections, type Role, type SectionId } from '../data/portfolio'
import { asset, useReducedMotion } from '../lib/env'
import RuleEyebrow from '../components/RuleEyebrow'
import { CertButton } from '../components/Certificate'
import { useCertViewer } from '../components/useCertViewer'
import './Force.css'

const pad = (n: number) => String(n).padStart(2, '0')

function RoleCard({ role, i, onCertificate }: { role: Role; i: number; onCertificate: (cert: NonNullable<Role['certificate']>, title: string) => void }) {
  return (
    <li className={`force__entry${role.current ? ' force__entry--current' : ''}`} data-reveal>
      <span className="force__node" aria-hidden="true" />
      <article className="force__card">
        <div className="force__side">
          <p className="mono force__file">
            File {pad(i + 1)} <span aria-hidden="true">·</span> {role.kind}
          </p>
          <h3 className="gothic force__role">{role.title}</h3>
          <p className="force__org">{role.org}</p>
          {role.place && <p className="mono force__place">{role.place}</p>}
          <p className="mono force__dates">
            {role.current && <span className="force__live" aria-hidden="true" />}
            {role.dates}
          </p>
        </div>
        <div className="force__body">
          {role.summary && <p className="force__summary">{role.summary}</p>}
          {role.pointsLabel && <p className="mono force__label">{role.pointsLabel}</p>}
          <ul className="force__points" role="list">
            {role.points.map((p) => (
              <li key={p.slice(0, 24)}>{p}</li>
            ))}
            {role.problems && (
              <li>
                Set {role.problems.length === 2 ? 'two' : role.problems.length} of its problems:{' '}
                {role.problems.map((pr, i) => (
                  <span key={pr.href}>
                    {i > 0 && (i === role.problems!.length - 1 ? ' and ' : ', ')}
                    <a className="force__problem" href={pr.href} target="_blank" rel="noopener noreferrer">
                      “{pr.label}”<span className="visually-hidden"> (problem on Toph, opens in a new tab)</span>
                    </a>
                  </span>
                ))}
              </li>
            )}
          </ul>
          {role.achievements && (
            <>
              <p className="mono force__label force__label--achieve">Key achievements</p>
              <ul className="force__points force__points--achieve" role="list">
                {role.achievements.map((a) => (
                  <li key={a.slice(0, 24)}>{a}</li>
                ))}
              </ul>
            </>
          )}
          {role.links && (
            <ul className="force__links" role="list">
              {role.links.map((l) => (
                <li key={l.href}>
                  <a className="mono force__link" href={/^https?:/.test(l.href) ? l.href : asset(l.href)} target="_blank" rel="noopener noreferrer">
                    {l.label}
                    <span className="visually-hidden">
                      {' '}
                      for {role.org} (opens in a new tab)
                    </span>
                    <svg className="force__link-arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                      <path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {role.certificate && (
            <CertButton cert={role.certificate} forLabel={role.org} onOpen={() => onCertificate(role.certificate!, role.org)} />
          )}
        </div>
      </article>
    </li>
  )
}

/**
 * A vertical timeline of case-file cards, shared by "The Task Force" (experience)
 * and "The Human World" (extracurricular). Same look; different file, lede and data.
 */
export function CaseFileSection({
  sectionId,
  subtitle,
  lede,
  entries,
}: {
  sectionId: SectionId
  subtitle: string
  lede: string
  entries: Role[]
}) {
  const meta = sections.find((s) => s.id === sectionId)
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const instant = reduced || typeof IntersectionObserver === 'undefined'
  const { open: openCertificate, viewer } = useCertViewer()

  useLayoutEffect(() => {
    if (!instant) ref.current?.classList.add('force--armed')
  }, [instant])

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (instant) {
      items.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [instant])

  return (
    <section id={sectionId} className="section force" aria-labelledby={`${sectionId}-title`} ref={ref}>
      <div className="container">
        <header className="force__intro" data-reveal>
          <RuleEyebrow numeral={meta?.numeral ?? ''} subtitle={subtitle} className="force__eyebrow" />
          <h2 className="gothic force__title" id={`${sectionId}-title`}>
            {meta?.label ?? subtitle}
          </h2>
          <p className="hand force__lede">{lede}</p>
        </header>

        <ol className="force__timeline" role="list">
          {entries.map((role, i) => (
            <RoleCard key={`${role.title}-${role.org}`} role={role} i={i} onCertificate={openCertificate} />
          ))}
        </ol>
      </div>
      {viewer}
    </section>
  )
}

export default function Force() {
  return (
    <CaseFileSection
      sectionId="force"
      subtitle="Experience"
      lede="Every investigation needs a team. These are the ones I joined."
      entries={roles}
    />
  )
}
