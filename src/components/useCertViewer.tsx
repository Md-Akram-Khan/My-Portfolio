// The certificate viewer hook, shared by the Contests ("Duels Fought") and
// Extracurricular ("The Human World") sections. Returns `open(cert, title)` to
// show a certificate and the `viewer` element to render once in the section.
// Escape, the backdrop and the close button all dismiss it; focus returns to the
// opener. Kept in its own file so Certificate.tsx stays component-only (fast refresh).
import { useId, useRef, useState } from 'react'
import { asset } from '../lib/env'
import './Certificate.css'

export type Cert = { webp: string; jpg: string; pdf: string; alt: string }

export function useCertViewer() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [view, setView] = useState<{ cert: Cert; title: string } | null>(null)

  const open = (cert: Cert, title: string) => {
    setView({ cert, title })
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  const viewer = (
    <dialog
      ref={dialogRef}
      className="cert-viewer"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) close() // backdrop
      }}
      onClose={() => setView(null)}
    >
      {view && (
        <div className="cert-viewer__inner">
          <header className="cert-viewer__head">
            <div>
              <p className="mono cert-viewer__kicker">Evidence · Certificate</p>
              <h3 className="gothic cert-viewer__title" id={titleId}>
                {view.title}
              </h3>
            </div>
            <button type="button" className="cert-viewer__close" onClick={close}>
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">Close the certificate</span>
            </button>
          </header>
          <picture>
            <source type="image/webp" srcSet={asset(view.cert.webp)} />
            <img className="cert-viewer__img" src={asset(view.cert.jpg)} alt={view.cert.alt} width={1280} height={720} />
          </picture>
          <a className="mono cert-viewer__pdf" href={asset(view.cert.pdf)} target="_blank" rel="noopener noreferrer">
            Open the PDF
            <span className="visually-hidden"> (opens in a new tab)</span>
            <svg className="cert-viewer__arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
              <path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </a>
        </div>
      )}
    </dialog>
  )

  return { open, viewer }
}
