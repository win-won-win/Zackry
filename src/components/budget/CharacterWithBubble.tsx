interface CharacterWithBubbleProps {
  message: string;
}

export function CharacterWithBubble({ message }: CharacterWithBubbleProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
        <img
          src="/zackry-lady.png"
          alt="Zackry guide"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative flex-1 bg-white rounded-2xl shadow-lg p-4 border-2 border-slate-200">
        <div className="absolute left-0 top-6 w-0 h-0 -ml-2 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
        <div className="absolute left-0 top-6 w-0 h-0 -ml-3 border-t-[9px] border-t-transparent border-r-[9px] border-r-slate-200 border-b-[9px] border-b-transparent"></div>
        <p className="text-slate-700 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
