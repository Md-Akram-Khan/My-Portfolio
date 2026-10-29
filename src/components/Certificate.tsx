// The "evidence print" button on a card: a tilted certificate thumbnail that
// opens the shared viewer (see useCertViewer). Used by Contests and Extracurricular.
import { asset } from '../lib/env'
import type { Cert } from './useCertViewer'
import './Certificate.css'

export function CertButton({ cert, forLabel, onOpen }: { cert: Cert; forLabel: string; onOpen: () => void }) {
  return (
    <button type="button" className="cert" onClick={onOpen}>
      <img className="cert__thumb" src={asset(cert.webp)} alt="" width={128} height={72} loading="lazy" decoding="async" />
      <span className="cert__text">
        <span className="mono cert__label">Evidence</span>
        <span className="cert__title">View certificate</span>
      </span>
      <span className="visually-hidden"> for {forLabel}</span>
    </button>
  )
}
