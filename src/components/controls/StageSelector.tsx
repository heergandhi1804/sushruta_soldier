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
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-indigo/10 bg-white/80 p-4 shadow-parchment sm:flex-row sm:flex-wrap sm:items-center">
      {stageList.map((stage) => (
        <button
          key={stage.id}
          onClick={() => onSelect(stage.id)}
          className={`rounded-3xl px-4 py-3 text-sm font-medium transition ${
            activeStage === stage.id
              ? 'bg-indigo text-white shadow-lg shadow-indigo/10'
              : 'border border-indigo/10 bg-parchment text-indigo hover:bg-indigo/5'
          }`}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
}
