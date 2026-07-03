import { useState } from 'react'
import type { CabinetMember } from '../types'

interface InstPanelProps {
  cabinet: CabinetMember[]
}

export function InstPanel({ cabinet }: InstPanelProps) {
  const [cabinetOpen, setCabinetOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-void-black font-inter">
      {/* CJI Card */}
      <div className="bg-carbon border border-iron rounded-lg p-8 flex flex-col justify-between transition-colors">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-electric-lime block mb-2">
            // JUDICIAL_ADMIN
          </span>
          <h3 className="text-[20px] font-bold text-pure-white leading-tight font-basier mb-3">
            Chief Justice of India
          </h3>
          <div className="text-[16px] font-bold text-paper mb-4">
            Justice Surya Kant
          </div>
          <p className="text-[15px] text-bone leading-relaxed">
            53rd Chief Justice of India. Assumed office November 24, 2025. Tenure running through February 9, 2027. Swore in 5 new Supreme Court judges on June 2, 2026.
          </p>
        </div>
        <div className="mt-8 pt-4 border-t border-iron text-[12px] font-mono text-smoke">
          ACTIVE_STRENGTH: 30 JUDGES
        </div>
      </div>

      {/* RBI Card */}
      <div className="bg-carbon border border-iron rounded-lg p-8 flex flex-col justify-between transition-colors">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-electric-lime block mb-2">
            // MONETARY_DESK
          </span>
          <h3 className="text-[20px] font-bold text-pure-white leading-tight font-basier mb-3">
            Reserve Bank of India
          </h3>
          <div className="text-[16px] font-bold text-paper mb-4">
            Governor: Sanjay Malhotra
          </div>
          <p className="text-[15px] text-bone leading-relaxed">
            MPC convened June 3–5, 2026. Repo rate held at 5.25% under a neutral monetary policy stance. Policy rates have decreased by 125 basis points since February 2025.
          </p>
        </div>
        <div className="mt-8 pt-4 border-t border-iron text-[12px] font-mono text-smoke flex justify-between">
          <span>CPI_METRIC: JAN 2026</span>
          <span className="text-electric-lime">ACTIVE</span>
        </div>
      </div>

      {/* Union Cabinet Card */}
      <div className="col-span-1 md:col-span-2 bg-carbon border border-iron rounded-lg p-8 transition-colors">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-electric-lime block mb-2">
              // EXECUTIVE_CABINET
            </span>
            <h3 className="text-[20px] font-bold text-pure-white font-basier">
              Union Cabinet — Modi 3.0
            </h3>
            <div className="text-[15px] text-paper mt-1">
              Prime Minister: Narendra Modi (BJP Led Coalition)
            </div>
            <p className="text-[15px] text-bone leading-relaxed max-w-[800px] mt-2">
              NDA Administration formed June 9, 2024. Total executive bench stands at 72 ministers: 30 Cabinet, 5 Ministers of State (Independent Charge), and 36 Ministers of State.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCabinetOpen((o) => !o)}
            className="border border-iron text-paper bg-graphite hover:border-steel px-4 py-2.5 text-[14px] font-semibold rounded-lg transition-colors"
          >
            {cabinetOpen ? 'Collapse Roster' : 'View Cabinet Roster'}
          </button>
        </div>

        {cabinetOpen && (
          <div className="mt-6 max-h-[300px] overflow-y-auto border-t border-iron pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 font-mono text-[13px]">
            {cabinet.map((m) => (
              <div
                key={m.name}
                className="flex justify-between items-center border-b border-iron py-2 last:border-b-0"
              >
                <span className="text-paper">{m.name}</span>
                <span className="text-smoke text-[12px]">{m.portfolio}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
