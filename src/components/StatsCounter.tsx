interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">
      {value}
    </div>
    <div className="text-sm text-muted-foreground">
      {label}
    </div>
  </div>
);

export const StatsCounter = () => {
  return (
    <div className="grid grid-cols-3 gap-8 md:gap-16 py-8">
      <StatItem value="10TB+" label="Data Stored" />
      <StatItem value="99.9%" label="Uptime" />
      <StatItem value="5K+" label="Users Waiting" />
    </div>
  );
};
