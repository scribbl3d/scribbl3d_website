interface RatingBarProps {
  percentage: number;
}

export function RatingBar({ percentage }: RatingBarProps) {
  return (
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-600 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
