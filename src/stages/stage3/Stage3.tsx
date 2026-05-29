import { useEffect, useMemo, useState } from 'react';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { PatientProfile } from '../../types/simulation';

const initialKashiPatients: PatientProfile[] = [
  {
    id: 'p1',
    name: 'Karna',
    occupation: 'Temple Soldier',
    age: 28,
    weight: 78,
    condition: 'Deep thigh slice from metal roof tile',
    story: 'He was guarding the temple gates when wind tore a bronze tile from the roof. The thigh is spurting blood, and his pulse is fading.',
    painLevel: 9,
    infectionRisk: 15,
    urgency: 10,
    status: 'waiting',
    visualId: '⚔️',
    waitTime: 0
  },
  {
    id: 'p2',
    name: 'Anya',
    occupation: 'Child',
    age: 9,
    weight: 28,
    condition: 'Deep palm cut on broken pottery',
    story: 'Frightened by the thunder, she fell in the courtyard and grabbed a jagged clay jar. Her palm is sliced deep, and she is crying in panic.',
    painLevel: 8,
    infectionRisk: 35,
    urgency: 8,
    status: 'waiting',
    visualId: '👧',
    waitTime: 0
  },
  {
    id: 'p3',
    name: 'Madhav',
    occupation: 'Farmer',
    age: 45,
    weight: 72,
    condition: 'Compound fracture of the left arm',
    story: 'Fell from a mango tree while securing his buffaloes in the storm. The bone has pierced the skin, and he is groaning in agony.',
    painLevel: 9,
    infectionRisk: 25,
    urgency: 7,
    status: 'waiting',
    visualId: '🌾',
    waitTime: 0
  },
  {
    id: 'p4',
    name: 'Gopal',
    occupation: 'Merchant',
    age: 52,
    weight: 85,
    condition: 'Lacerated scalp wound',
    story: 'Struck by a falling wooden beam at the spice bazaar. Scalp wounds bleed heavily, causing him intense fright, though it is not a deep fracture.',
    painLevel: 6,
    infectionRisk: 10,
    urgency: 5,
    status: 'waiting',
    visualId: '⚖️',
    waitTime: 0
  },
  {
    id: 'p5',
    name: 'Ramdas',
    occupation: 'Copper Craftsman',
    age: 38,
    weight: 68,
    condition: 'Crucible burn on the forearm',
    story: 'Lightning struck near his furnace, spilling molten copper onto his arm. The skin is blistered and black, causing a dry, burning shock.',
    painLevel: 8,
    infectionRisk: 20,
    urgency: 6,
    status: 'waiting',
    visualId: '🔨',
    waitTime: 0
  }
];

const fragment = manuscriptFragments.find((item) => item.id === 'stage3-triage');

const sutureOptions = [
  { id: 'hemp', label: 'Hemp (Bark fiber)', strength: 80, infectionRisk: 12, healing: 65, description: 'Coarse, thick thread. Strong but rough on sensitive tissue.' },
  { id: 'sinew', label: 'Sinew (Animal fiber)', strength: 90, infectionRisk: 8, healing: 78, description: 'Extremely strong, absorbs naturally, but requires deep cleansing.' },
  { id: 'hair', label: 'Human Hair', strength: 50, infectionRisk: 14, healing: 60, description: 'Thin and flexible. Leaves no visible scars, ideal for faces/palms.' },
  { id: 'ants', label: 'Bengal Ants (Clamps)', strength: 40, infectionRisk: 18, healing: 50, description: 'Ancient method: ants bite the margins closed, then heads are severed.' }
];

const herbs = [
  { id: 'vacha', label: 'Vacha (Sweet Flag)', effect: 'Calms the nervous system, alleviates shock, and numbs pain.' },
  { id: 'nimba', label: 'Nimba (Neem Leaf)', effect: 'Potent cooling antiseptic, purges heat, and prevents rot (infection).' },
  { id: 'trifala', label: 'Triphala (Three Fruits)', effect: 'Restores the humors, promotes clean scar formation and tissue repair.' }
];

export default function Stage3() {
  const { realityLayer, updateScroll, updateConsequences, addHistory, setSushrutaDialogue } = useSimulation();
  const [queue, setQueue] = useState<PatientProfile[]>(initialKashiPatients);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [anesthesiaDose, setAnesthesiaDose] = useState(6);
  const [suture, setSuture] = useState(sutureOptions[0].id);
  const [postOpHerb, setPostOpHerb] = useState(herbs[0].id);
  const [decisionChain, setDecisionChain] = useState<string>('Select a shivering citizen on the recovery mats to examine their condition.');
  const [activeStep, setActiveStep] = useState(0); // 0: select/examine, 1: choose treatment

  // Active wait time ticker representing the ticking storm
  useEffect(() => {
    const interval = window.setInterval(() => {
      setQueue((prevQueue) =>
        prevQueue.map((patient) => {
          if (patient.status !== 'waiting') return patient;
          const nextWait = patient.waitTime + 1;
          const painIncr = nextWait % 5 === 0 ? 1 : 0;
          const infectIncr = nextWait % 6 === 0 ? 2 : 0;
          return {
            ...patient,
            waitTime: nextWait,
            painLevel: Math.min(10, patient.painLevel + painIncr),
            infectionRisk: Math.min(100, patient.infectionRisk + infectIncr)
          };
        })
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const activeFragment = fragment ? fragment[realityLayer] : '';

  function handleSelectPatient(patient: PatientProfile) {
    if (patient.status !== 'waiting') return;
    setSelectedPatient(patient);
    setActiveStep(1);

    // Dynamic Acharya Sushruta dialogue based on patient choice
    if (patient.id === 'p1') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Karna is bleeding rapidly from the femoral line (Gupt-Sira). Apply pressure, administer a strong dose of Vacha, and close the wound with sturdy animal sinew. Do not delay!',
        expression: 'concerned'
      });
    } else if (patient.id === 'p2') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Anya\'s hand requires delicate care. Hemp is too coarse; use human hair for sutures so her fingers regain full mobility, and wash it with Nimba oil.',
        expression: 'calm'
      });
    } else if (patient.id === 'p3') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Madhav\'s broken arm is painful. Provide a balanced dose of Vacha, align the bone with traction, and close the skin safely. If he moves in pain, the alignment will fail.',
        expression: 'thoughtful'
      });
    } else if (patient.id === 'p4') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Gopal\'s head wound looks frightening because scalp cuts bleed heavily, but his vitals are stable. Calm his heart, elevate his head, and stitch with care.',
        expression: 'calm'
      });
    } else {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Ramdas has a molten metal burn. Do not suture immediately; cool the skin with Triphala and ghee, and bind it in clean linen cotton. The heat must be cleared.',
        expression: 'thoughtful'
      });
    }

    setDecisionChain(`Evaluating ${patient.name}. Age ${patient.age}, Weight ${patient.weight}kg. Adjust anesthesia and choose closure.`);
  }

  function treatPatient() {
    if (!selectedPatient) return;
    const patient = selectedPatient;
    const sedation = calculateSedation(anesthesiaDose, patient.age, patient.weight, patient.urgency);
    const sut = sutureOptions.find((option) => option.id === suture) ?? sutureOptions[0];
    const herb = herbs.find((item) => item.id === postOpHerb)!;

    const anesthesiaIssues = sedation < 35 ? 'low' : sedation > 80 ? 'high' : 'balanced';
    let result = '';
    const changes: Record<string, number> = {};

    // 1. Anesthesia response
    if (anesthesiaIssues === 'low') {
      result += 'Under-dosed anesthesia. The patient screamed and writhed in pain, causing the suture needles to slip. ';
      changes.pain = 15;
      changes.trust = -12;
      changes.infection = 6;
    } else if (anesthesiaIssues === 'high') {
      result += 'Overdosed anesthesia. The patient sank into a deep, sluggish coma, slowing respiratory recovery. ';
      changes.recovery = -12;
      changes.pain = -5;
      changes.trust = -5;
    } else {
      result += 'Sedation was perfectly balanced. The patient remained calm and cooperative. ';
      changes.trust = 8;
      changes.recovery = 10;
    }

    // 2. Suture match
    if (patient.id === 'p2') { // Anya the child
      if (sut.id === 'hair') {
        result += 'Human hair sutures were gentle and left no thick scars on her young palm. ';
        changes.recovery = (changes.recovery ?? 0) + 8;
        changes.trust = (changes.trust ?? 0) + 6;
      } else {
        result += `The thick ${sut.label} was too coarse for her palm, causing stiff movement and scar tissue. `;
        changes.pain = (changes.pain ?? 0) + 8;
        changes.permanentDamage = 5;
      }
    } else if (patient.id === 'p1') { // Karna the soldier
      if (sut.id === 'sinew') {
        result += 'Sturdy animal sinew held the deep muscle slice secure against high physical tension. ';
        changes.recovery = (changes.recovery ?? 0) + 8;
        changes.surgicalControl = 5;
      } else {
        result += `The weak ${sut.label} was insufficient for the heavy muscle slice, leading to minor re-opening. `;
        changes.bloodLoss = 12;
        changes.pain = (changes.pain ?? 0) + 6;
      }
    } else { // Others
      result += `The wound was bound with ${sut.label}. `;
    }

    // 3. Post-operative herbs response
    if (herb.id === 'nimba') {
      result += 'Nimba leaves cooled the wound and purged rot. ';
      changes.infection = (changes.infection ?? 0) - 10;
    } else if (herb.id === 'vacha') {
      result += 'Vacha powder relieved the shock and calmed the heart. ';
      changes.pain = (changes.pain ?? 0) - 8;
      changes.trust = (changes.trust ?? 0) + 4;
    } else {
      result += 'Triphala promoted tissue regeneration and clean healing. ';
      changes.recovery = (changes.recovery ?? 0) + 8;
    }

    // 4. Wait-time penalty
    if (patient.waitTime > 30) {
      result += ' However, the severe delay in treatment left the wound highly congested with dirt and dark humors.';
      changes.infection = (changes.infection ?? 0) + 12;
      changes.trust = (changes.trust ?? 0) - 8;
    }

    setDecisionChain(result);
    updateConsequences({
      pain: changes.pain ?? 0,
      infection: changes.infection ?? 0,
      recovery: changes.recovery ?? 0,
      trust: changes.trust ?? 0,
      permanentDamage: changes.permanentDamage ?? 0
    });

    updateScroll({ diagnosis: 6, surgicalControl: 6, ethics: 8 });
    addHistory(`Stage 3: Treated ${patient.name} (${patient.occupation}) with ${sut.label} and ${herb.label}.`);

    setQueue((current) =>
      current.map((item) => (item.id === patient.id ? { ...item, status: 'treated' } : item))
    );

    // Dialogue transition based on outcome
    setSushrutaDialogue({
      speaker: 'Acharya Sushruta',
      text: `Treatment complete. You solved the crisis for ${patient.name}. Continue tending to the others in the hall—every soul matters.`,
      expression: 'approving'
    });

    setSelectedPatient(null);
    setActiveStep(0);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      {/* Triage Area */}
      <section className="rounded-[32px] border border-amber/15 bg-white/70 p-6 shadow-parchment">
        <div className="border-b border-indigo/15 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Chapter 3</span>
          <h3 className="font-serif text-2xl font-bold text-indigo">The Reconstruction Academy</h3>
          <p className="mt-1 text-sm text-indigo/70">
            A fierce monsoon storm has flooded Kashi. The Gurukul is full of injured villagers. Prioritize treatments, calibrate anesthesia, and stitch wounds.
          </p>
        </div>

        {activeStep === 0 ? (
          /* Step 0: Recovery Mats Triage */
          <div className="mt-6 space-y-4">
            <h4 className="text-xs font-bold text-indigo uppercase tracking-wider">Patient Recovery Mats</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {queue.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  disabled={patient.status === 'treated'}
                  className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all ${
                    patient.status === 'treated'
                      ? 'border-indigo/5 bg-indigo/5 opacity-50'
                      : patient.urgency >= 8
                      ? 'border-danger/40 bg-danger/5 hover:border-danger'
                      : 'border-indigo/10 bg-white/90 hover:border-amber/40'
                  }`}
                >
                  {/* Visual Avatar */}
                  <div className="flex justify-between items-start border-b border-indigo/5 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{patient.visualId}</span>
                      <div>
                        <span className="font-serif font-bold text-indigo text-base">{patient.name}</span>
                        <p className="text-[10px] text-indigo/50 tracking-wider font-semibold uppercase">{patient.occupation}</p>
                      </div>
                    </div>
                    {patient.status === 'treated' ? (
                      <span className="rounded-full bg-herbal/10 border border-herbal/20 px-2.5 py-0.5 text-[10px] font-bold text-herbal uppercase tracking-wider">
                        Bound & Recovering
                      </span>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        patient.urgency >= 8 ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-amber/10 text-amber border border-amber/20'
                      }`}>
                        Urgency: {patient.urgency}/10
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-indigo/80 font-light line-clamp-2">
                    {patient.condition}
                  </p>

                  {patient.status === 'waiting' && (
                    <div className="mt-4 flex items-center justify-between border-t border-indigo/5 pt-2 text-[10px]">
                      <span className="text-danger font-semibold">Pain: {patient.painLevel}/10</span>
                      <span className="text-amber font-semibold">Infection: {patient.infectionRisk}%</span>
                      <span className="text-indigo/50">Wait: {patient.waitTime}s</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 1: Specific Patient Treatment interface */
          selectedPatient && (
            <div className="mt-6 space-y-6">
              {/* Patient header info */}
              <div className="rounded-[24px] border border-amber/20 bg-gradient-to-br from-amber-100/40 via-parchment/60 to-amber-200/20 p-5 shadow-inner">
                <div className="flex justify-between items-center border-b border-indigo/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedPatient.visualId}</span>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-indigo">{selectedPatient.name}</h4>
                      <p className="text-xs text-indigo/60 uppercase tracking-wider font-semibold">{selectedPatient.occupation} • Age {selectedPatient.age} • Weight {selectedPatient.weight}kg</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setActiveStep(0);
                    }}
                    className="text-xs text-indigo/60 hover:text-indigo font-bold underline"
                  >
                    Back to Mats
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-indigo/80 italic font-light pl-4 border-l border-amber">
                  "{selectedPatient.story}"
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Anesthesia slider panel */}
                <div className="rounded-[24px] border border-indigo/10 bg-white/80 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-indigo uppercase tracking-wider">Soma/Vacha Anesthesia</h4>
                  <p className="text-xs text-indigo/60">Calibrate the herbal dosage based on the patient's age and pain level.</p>
                  
                  <div className="pt-4">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={anesthesiaDose}
                      onChange={(e) => setAnesthesiaDose(Number(e.target.value))}
                      className="w-full h-1.5 bg-indigo/10 rounded-full appearance-none cursor-pointer accent-indigo"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-indigo/70">
                      <span>Mild (1 seed)</span>
                      <span className="text-indigo text-base font-bold bg-indigo/5 px-2 py-0.5 rounded-lg">{anesthesiaDose} Seeds</span>
                      <span>Strong (12 seeds)</span>
                    </div>
                  </div>
                </div>

                {/* Post-Op Herbs selector */}
                <div className="rounded-[24px] border border-indigo/10 bg-white/80 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-indigo uppercase tracking-wider">Post-Operative Herb</h4>
                  <div className="grid gap-2">
                    {herbs.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setPostOpHerb(h.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                          postOpHerb === h.id ? 'border-herbal bg-herbal/10 text-herbal' : 'border-indigo/5 bg-parchment/40 hover:border-indigo/20'
                        }`}
                      >
                        <span className="font-semibold text-sm block">{h.label}</span>
                        <span className="text-[10px] text-indigo/70 font-light block mt-0.5">{h.effect}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suturing section */}
              <div className="rounded-[24px] border border-indigo/10 bg-white/80 p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo uppercase tracking-wider">Suture Materials (Yantra-Sutra)</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sutureOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSuture(option.id)}
                      className={`rounded-2xl border p-3 text-left transition-all ${
                        suture === option.id ? 'border-herbal bg-herbal/10' : 'border-indigo/10 bg-parchment/40 hover:border-indigo/30'
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-indigo/5 pb-1">
                        <span className="font-semibold text-indigo text-sm">{option.label}</span>
                        <span className="text-[9px] text-indigo/50">Tension {option.strength}</span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-indigo/70 font-light leading-5">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={treatPatient}
                className="w-full rounded-full bg-gradient-to-r from-herbal to-emerald-700 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95"
              >
                Perform Treatment & Bind Wound
              </button>
            </div>
          )
        )}
      </section>

      {/* Side Narrative info */}
      <aside className="space-y-6">
        {/* Causal Outcome */}
        <div className="rounded-[32px] border border-amber/15 bg-amber-50/50 p-5 shadow-parchment">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Triage Diagnostics</span>
          <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/5 pb-2">Gurukul Action Log</h4>
          <p className="mt-3 text-sm leading-6 text-indigo/80">
            {decisionChain}
          </p>
        </div>

        {/* Epistemological Fragment scroll */}
        <div className="rounded-[32px] border border-indigo/15 bg-parchment-scroll p-6 shadow-parchment relative">
          <div className="absolute top-0 bottom-0 left-4 w-[1px] bg-amber-700/10" />
          <div className="pl-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Epistemological Source</span>
            <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/10 pb-2">
              Manuscript Fragment
            </h4>
            <p className="mt-4 text-sm leading-7 text-indigo/80 italic font-light">
              {activeFragment}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function calculateSedation(dose: number, age: number, weight: number, urgency: number) {
  const base = dose * 8;
  const ageFactor = age < 12 ? 1.25 : age > 50 ? 0.85 : 1;
  const weightFactor = weight < 50 ? 0.85 : weight > 80 ? 1.15 : 1;
  const urgencyFactor = urgency / 10;
  return Math.round(base * ageFactor * weightFactor * urgencyFactor);
}
