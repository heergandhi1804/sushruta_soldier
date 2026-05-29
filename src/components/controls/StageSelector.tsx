interface StageItem {
  id: number;
  label: string;
}

export function StageSelector({
  stageList,
  activeStage,
  onSelect
}: {
  stageList: StageItem[];
  activeStage: number;
  onSelect: (stage: number) => void;
}) {
  const chapterLocations = [
    'Courtyard (Dawn)',
    'Study Hall (Midday)',
    'Recovery Hall (Storm)',
    'Tool Forge (Night)'
  ];

  return (
    <div className="flex flex-col gap-3 rounded-[32px] border border-amber/15 bg-white/80 p-4 shadow-parchment sm:flex-row sm:flex-wrap sm:items-center">
      <span className="text-xs font-bold text-indigo/60 uppercase tracking-widest px-2">
        Gurukul Studies:
      </span>
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        {stageList.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onSelect(stage.id)}
            className={`rounded-[24px] px-5 py-3 text-xs font-semibold tracking-wider uppercase transition-all ${
              activeStage === stage.id
                ? 'bg-gradient-to-r from-amber to-copper text-white shadow-md'
                : 'border border-indigo/10 bg-parchment/40 text-indigo hover:border-amber/40 hover:bg-parchment/70'
            }`}
          >
            <span className="block font-serif font-bold text-sm tracking-normal capitalize">
              {stage.label}
            </span>
            <span className="block text-[9px] opacity-80 mt-0.5">
              {chapterLocations[stage.id - 1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

