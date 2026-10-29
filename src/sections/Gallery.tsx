// RULE VII · "The Evidence Room" — the case evidence, filed as certificates and
// award prints. Two belts of prints run in opposite directions in an endless loop,
// like evidence passing on a conveyor; hover (or tab onto) a belt to hold it still.
// Clicking a print opens a lightbox (native modal <dialog>) with prev/next + arrows.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gallery, sections, type GalleryKind } from '../data/portfolio'
import { asset, useReducedMotion } from '../lib/env'
import RuleEyebrow from '../components/RuleEyebrow'
import './Gallery.css'

const meta = sections.find((s) => s.id === 'gallery')
const KIND_ONE: Record<GalleryKind, string> = { certificate: 'Certificate', award: 'Award', event: 'Event' }
const pad = (n: number) => String(n).padStart(2, '0')

// Enough prints per belt that one copy is wider than the screen. The two belts
// split the evidence (even indices on top, odd on the bottom); each is repeated
// up to this length, then the whole belt is duplicated so the loop is seamless.
const MIN_PER_BELT = 8
function belt(items: typeof gallery): typeof gallery {
  if (!items.length) return []
  const out = [...items]
  for (let k = 0; out.length < MIN_PER_BELT; k++) out.push(items[k % items.length])
  return out
}
const belts = [belt(gallery.filter((_, i) => i % 2 === 0)), belt(gallery.filter((_, i) => i % 2 === 1))]

export default function Gallery() {
  const ref = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const reduced = useReducedMotion()
  const instant = reduced || typeof IntersectionObserver === 'undefined'
  const [index, setIndex] = useState<number | null>(null)

  const current = index === null ? null : gallery[index]

  useLayoutEffect(() => {
    if (!instant) ref.current?.classList.add('gallery--armed')
  }, [instant])

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'))
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [instant])

  const open = (i: number) => {
    setIndex(i)
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()
  const step = (d: number) => setIndex((i) => (i === null ? i : (i + d + gallery.length) % gallery.length))

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (gallery.length < 2) return
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title" ref={ref}>
      <div className="container">
        <header className="gallery__intro" data-reveal>
          <div>
            <RuleEyebrow numeral={meta?.numeral ?? 'VIII'} subtitle="Gallery" className="gallery__eyebrow" />
            <h2 className="gothic gallery__title-main" id="gallery-title">
              {meta?.label ?? 'Evidence Room'}
            </h2>
            <p className="hand gallery__lede">The evidence never stops moving. Hover a print to hold it still.</p>
          </div>
        </header>
      </div>

      {/* Full-bleed conveyor: two belts scrolling in opposite directions. The belts
          keep moving under the cursor; they pause only while a print is open. */}
      <div className={`gallery__reel${index !== null ? ' is-paused' : ''}`} data-reveal aria-label="Certificates and awards">
        {belts.map((items, b) => (
          <div className={`gallery__row gallery__row--${b === 0 ? 'a' : 'b'}`} key={b}>
            <ul className="gallery__track" role="list" style={{ '--dur': `${items.length * 6}s` } as React.CSSProperties}>
              {[...items, ...items].map((item, i) => {
                const gi = gallery.indexOf(item)
                const dup = i >= items.length // second copy: present for the loop, hidden from AT and tab order
                return (
                  <li className="gallery__card" key={i} aria-hidden={dup || undefined}>
                    <button type="button" className="gallery__print" onClick={() => open(gi)} tabIndex={dup ? -1 : undefined}>
                      <span className="gallery__pin" aria-hidden="true" />
                      <span className="gallery__frame">
                        <picture>
                          <source type="image/webp" srcSet={asset(item.webp)} />
                          <img src={asset(item.jpg)} alt={dup ? '' : item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
                        </picture>
                        <span className="mono gallery__tag" aria-hidden="true">
                          Exhibit {pad(gi + 1)}
                        </span>
                      </span>
                      <span className="gallery__label">
                        <span className="mono gallery__kind">
                          {KIND_ONE[item.kind]}
                          {item.date ? ` · ${item.date}` : ''}
                        </span>
                        <span className="hand gallery__title">{item.title}</span>
                      </span>
                      <span className="visually-hidden">, open larger</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="gallery__viewer"
        aria-labelledby="gallery-viewer-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close() // backdrop
        }}
        onKeyDown={onKeyDown}
        onClose={() => setIndex(null)}
      >
        {current && (
          <div className="gallery__viewer-inner">
            <header className="gallery__viewer-head">
              <div>
                <p className="mono gallery__viewer-kicker">
                  Exhibit {pad(index! + 1)} · {KIND_ONE[current.kind]}
                  {current.date ? ` · ${current.date}` : ''}
                </p>
                <h3 className="gothic gallery__viewer-title" id="gallery-viewer-title">
                  {current.title}
                </h3>
              </div>
              <button type="button" className="gallery__viewer-close" onClick={close}>
                <span aria-hidden="true">×</span>
                <span className="visually-hidden">Close</span>
              </button>
            </header>
            <div className="gallery__viewer-stage">
              <picture>
                <source type="image/webp" srcSet={asset(current.webp)} />
                <img className="gallery__viewer-img" src={asset(current.jpg)} alt={current.alt} width={current.width} height={current.height} />
              </picture>
              {gallery.length > 1 && (
                <>
                  <button type="button" className="gallery__nav gallery__nav--prev" onClick={() => step(-1)}>
                    <span aria-hidden="true">‹</span>
                    <span className="visually-hidden">Previous photo</span>
                  </button>
                  <button type="button" className="gallery__nav gallery__nav--next" onClick={() => step(1)}>
                    <span aria-hidden="true">›</span>
                    <span className="visually-hidden">Next photo</span>
                  </button>
                </>
              )}
            </div>
            <footer className="gallery__viewer-foot">
              {current.caption && <p className="gallery__viewer-caption">{current.caption}</p>}
              <div className="gallery__viewer-actions">
                {gallery.length > 1 && (
                  <span className="mono gallery__count" aria-live="polite">
                    {index! + 1} / {gallery.length}
                  </span>
                )}
                {current.pdf && (
                  <a className="mono gallery__pdf" href={asset(current.pdf)} target="_blank" rel="noopener noreferrer">
                    Open the PDF ↗<span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </footer>
          </div>
        )}
      </dialog>
    </section>
  )
}
