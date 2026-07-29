"use client";

type BarcodeProps = {
  value: string;
  className?: string;
};

export function Barcode({ value, className = "" }: BarcodeProps) {
  // Deterministic bar widths array based on string input
  const bars: number[] = [];
  bars.push(3, 1, 1, 3); // Start pattern

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const b1 = (code % 3) + 1;
    const b2 = ((code >> 1) % 3) + 1;
    const b3 = ((code >> 2) % 3) + 1;
    bars.push(b1, b2, b3, 1);
  }

  bars.push(3, 1, 3, 1); // Stop pattern

  const totalWidth = bars.reduce((acc, curr) => acc + curr, 0);

  let currentX = 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width="100%"
        height="44"
        viewBox={`0 0 ${totalWidth} 44`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={totalWidth} height="44" fill="#ffffff" />
        {bars.map((w, idx) => {
          const isBar = idx % 2 === 0;
          const x = currentX;
          currentX += w;
          if (!isBar) return null;
          return (
            <rect
              key={idx}
              x={x}
              y="0"
              width={w}
              height="44"
              fill="#09090b"
            />
          );
        })}
      </svg>
      <span className="mt-1 font-mono text-[10px] font-bold text-slate-900 tracking-widest uppercase">
        *{value}*
      </span>
    </div>
  );
}
