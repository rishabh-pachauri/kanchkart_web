"use client";

import { generateQrMatrix } from "@/lib/qr-generator";

type QRCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

export function QRCode({ value, size = 120, className = "" }: QRCodeProps) {
  const grid = generateQrMatrix(value, 25);
  const gridSize = grid.length;
  const cellSize = 10;
  const viewBoxSize = gridSize * cellSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
      {grid.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}
