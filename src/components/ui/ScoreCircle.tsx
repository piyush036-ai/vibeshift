"use client";
import { getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colorClass = getScoreColor(score);

  const strokeColor =
    score >= 85 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute" style={{ transform: "none" }}>
        {/* score is overlaid by parent */}
      </div>
      {label && (
        <span className={`text-xs font-semibold ${colorClass}`}>{label}</span>
      )}
    </div>
  );
}

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreCircle({ score, size = "md" }: ScoreCircleProps) {
  const dims = { sm: 56, md: 80, lg: 110 };
  const textSizes = { sm: "text-sm", md: "text-xl", lg: "text-3xl" };
  const dim = dims[size];
  const sw = size === "sm" ? 5 : size === "md" ? 6 : 8;
  const radius = (dim - sw) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    score >= 85 ? "#10b981" : score >= 65 ? "#f59e0b" : "#ef4444";
  const textColor = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#1e1e2e" strokeWidth={sw} />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "rotate(0deg)" }}>
        <span className={`font-bold ${textSizes[size]} ${textColor}`}>{score}</span>
      </div>
    </div>
  );
}

