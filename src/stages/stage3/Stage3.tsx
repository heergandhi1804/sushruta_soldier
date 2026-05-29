import { useEffect, useMemo, useState } from 'react';
import patientsData from '../../data/patients.json';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { PatientProfile } from '../../types/simulation';

const fragment = manuscriptFragments.find((item) => item.id === 'stage3-triage');

const sutureOptions = [
  { id: 'hemp', label: 'Hemp', strength: 84, infectionRisk: 10, flexibility: 50, healing: 68 },
  { id: 'sinew', label: 'Sinew', strength: 72, infectionRisk: 8, flexibility: 62, healing: 72 },
  { id: 'hair', label: 'Human Hair', strength: 48, infectionRisk: 12, flexibility: 82, healing: 56 },
  { id: 'ants', label: 'Bengal Ants', strength: 36, infectionRisk: 20, flexibility: 34, healing: 42 }
];

const herbs = [
  { id: 'vacha', label: 'Vacha', effect: 'Supports digestion and infection resistance' },
  { id: 'nimba', label: 'Nimba', effect: 'Clears heat and supports wound cleansing' },
  { id: 'trifala', label: 'Triphala', effect: 'Promotes gentle recovery and tissue repair' }
];

export default function Stage3() {
  const { realityLayer, updateScroll, updateConsequences, addHistory } = useSimulation();
  const [queue, setQueue] = useState<PatientProfile[]>(() => patientsData as PatientProfile[]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [anesthesiaDose, setAnesthesiaDose] = useState(8);
  const [suture, setSuture] = useState(sutureOptions[0].id);
  const [postOpHerb, setPostOpHerb] = useState(herbs[0].id);
  const [decisionChain, setDecisionChain] = useState<string>('Choose a patient and evaluate urgency before you treat them.');

  useEffect(() => {
    if (!selectedPatient) return;
    const sedation = calculateSedation(anesthesiaDose, selectedPatient.age, selectedPatient.weight, selectedPatient.urgency);
    if (sedation < 35) {
      setDecisionChain('Too little anesthesia → pain and movement → treatment becomes risky.');
    } else if (sedation > 80) {
      setDecisionChain('Too much anesthesia → complications and longer recovery.');
    } else {
      setDecisionChain('Balanced anesthesia → stable sedation → safer treatment and recovery.');
    }
  }, [anesthesiaDose, selectedPatient]);

  function treatPatient(patient: PatientProfile) {
    setSelectedPatient(patient);
    const sedation = calculateSedation(anesthesiaDose, patient.age, patient.weight, patient.urgency);
    const sut = sutureOptions.find((option) => option.id === suture) ?? sutureOptions[0];
    const herb = herbs.find((item) => item.id === postOpHerb)!;

    const anesthesiaIssues = sedation < 35 ? 'low' : sedation > 80 ? 'high' : 'balanced';
    let result = '';
    const changes: Record<string, number> = {} as Record<string, number>;

    if (anesthesiaIssues === 'low') {
      result += 'Under-dosed anesthesia caused pain and patient movement. ';
      changes.pain = 12;
      changes.trust = -8;
      changes.infection = 5;
    } else if (anesthesiaIssues === 'high') {
      result += 'Overdosed anesthesia slowed recovery and increased complications. ';
      changes.recovery = -10;
      changes.pain = -4;
      changes.trust = -4;
    } else {
      result += 'Sedation was balanced for this patient. ';
      changes.trust = 6;
      changes.recovery = 8;
    }

    if (sut.infectionRisk > 12) {
      result += `The ${sut.label} sutures increased infection risk. `;
      changes.infection = (changes.infection ?? 0) + 8;
      changes.permanentDamage = 4;
    } else {
      result += `The ${sut.label} sutures provided stable closure. `;
      changes.precision = 3;
    }

    if (herb.id === 'nimba') {
      result += 'Nimba supported wound cleansing. ';
      changes.infection = (changes.infection ?? 0) - 6;
      changes.recovery = (changes.recovery ?? 0) + 4;
    }
    if (herb.id === 'vacha') {
      result += 'Vacha lowered discomfort and supported calm. ';
      changes.pain = (changes.pain ?? 0) - 4;
      changes.trust = (changes.trust ?? 0) + 2;
    }

    setDecisionChain(`${result}Decision → Biological Effect → Patient Outcome`);
    updateConsequences({
      pain: changes.pain ?? 0,
      infection: changes.infection ?? 0,
      recovery: changes.recovery ?? 0,
      trust: changes.trust ?? 0,
      permanentDamage: changes.permanentDamage ?? 0
    });
    updateScroll({ diagnosis: 4, surgicalControl: 5, ethics: 3 });
    addHistory(`Stage 3: treated ${patient.condition} with ${sut.label} and ${herb.label}.`);
    setQueue((current) => current.map((item) => (item.id === patient.id ? { ...item, status: 'treated' } : item)));
  }

  const activeFragment = fragment ? fragment[realityLayer] : '';

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-indigo/10 bg-parchment/80 p-5 shadow-parchment">
        <h3 className="text-xl font-semibold text-indigo">The Reconstruction Academy</h3>
        <p className="mt-2 text-sm leading-6 text-indigo/75">
          Prioritize patients, set anesthesia for age and weight, choose the best suture material, and support recovery with herbs.
        </p>
        <div className="mt-6 grid gap-4">
          <div className="overflow-hidden rounded-3xl border border-indigo/10 bg-white/90">
            <div className="grid grid-cols-6 gap-2 bg-indigo/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-indigo">
              <span className="col-span-2">Condition</span>
              <span>Urgency</span>
              <span>Pain</span>
              <span>Risk</span>
              <span>Action</span>
            </div>
            <div className="divide-y divide-indigo/10">
              {queue.map((patient) => (
                <div key={patient.id} className="grid grid-cols-6 gap-2 px-4 py-4 text-sm text-indigo/80 sm:grid-cols-6">
                  <div className="col-span-2">
                    <p className="font-semibold text-indigo">{patient.condition}</p>
                    <p className="text-xs text-indigo/60">Age {patient.age}, {patient.weight}kg</p>
                  </div>
                  <div>{patient.urgency}</div>
                  <div>{patient.painLevel}</div>
                  <div>{patient.infectionRisk}%</div>
                  <div>
                    <button
                      type="button"
                      disabled={patient.status !== 'waiting'}
                      onClick={() => treatPatient(patient)}
                      className="rounded-full bg-herbal px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Treat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
              <p className="font-semibold text-indigo">Anesthesia dosage</p>
              <p className="mt-2 text-sm text-indigo/70">Adjust based on patient age, weight, and wound urgency.</p>
              <div className="mt-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={anesthesiaDose}
                  onChange={(event) => setAnesthesiaDose(Number(event.target.value))}
                  className="w-full"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-indigo/80">
                  <span>Low</span>
                  <span>{anesthesiaDose}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
                <p className="font-semibold text-indigo">Suture material</p>
                <div className="mt-3 space-y-3">
                  {sutureOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSuture(option.id)}
                      className={`w-full rounded-3xl border px-4 py-3 text-left text-sm transition ${
                        suture === option.id ? 'border-herbal bg-herbal/10' : 'border-indigo/10 bg-parchment/90 hover:border-indigo/50'
                      }`}
                    >
                      <p className="font-semibold text-indigo">{option.label}</p>
                      <p className="mt-1 text-xs text-indigo/70">Strength {option.strength}, infection risk {option.infectionRisk}%</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
                <p className="font-semibold text-indigo">Post-operative herb</p>
                <div className="mt-3 space-y-3">
                  {herbs.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPostOpHerb(option.id)}
                      className={`w-full rounded-3xl border px-4 py-3 text-left text-sm transition ${
                        postOpHerb === option.id ? 'border-herbal bg-herbal/10' : 'border-indigo/10 bg-parchment/90 hover:border-indigo/50'
                      }`}
                    >
                      <p className="font-semibold text-indigo">{option.label}</p>
                      <p className="mt-1 text-xs text-indigo/70">{option.effect}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-4 rounded-3xl border border-indigo/10 bg-white/90 p-5 shadow-parchment">
        <div className="rounded-3xl bg-parchment/95 p-4">
          <p className="text-sm uppercase tracking-[0.35em] text-amber">Causal chain</p>
          <p className="mt-3 text-sm leading-6 text-indigo/80">{decisionChain}</p>
        </div>
        <div className="rounded-3xl bg-indigo/5 p-4">
          <p className="text-sm font-semibold text-indigo">Manuscript fragment</p>
          <p className="mt-3 text-sm leading-6 text-indigo/80">{activeFragment}</p>
        </div>
      </aside>
    </div>
  );
}

function calculateSedation(dose: number, age: number, weight: number, urgency: number) {
  const base = dose * 8;
  const ageFactor = age < 12 ? 1.2 : age > 50 ? 0.9 : 1;
  const weightFactor = weight < 50 ? 0.9 : weight > 80 ? 1.1 : 1;
  const urgencyFactor = urgency / 10;
  return Math.round(base * ageFactor * weightFactor * urgencyFactor);
}
