// RULE III · "The Human World" — extracurricular activities. A Shinigami who grows
// bored of its own realm descends to walk among the living; these are the things done
// beside the work — organizing, workshops, club leadership and volunteering.
// Same case-file timeline as The Task Force (see Force.tsx), different data and lede.
import { extracurriculars } from '../data/portfolio'
import { CaseFileSection } from './Force'

export default function TheHumanWorld() {
  return (
    <CaseFileSection
      sectionId="world"
      subtitle="Extracurricular"
      lede="Beyond the investigation, the reaper walks among the living — the work done side by side."
      entries={extracurriculars}
    />
  )
}
