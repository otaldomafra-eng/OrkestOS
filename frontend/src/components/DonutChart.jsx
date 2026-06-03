import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DonutChart = ({ value, size = 120, color = '#3b9eff', label = '' }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  const COLORS = [color, '#101012'];

  return (
    <div className="flex flex-col items-center" data-testid="donut-chart">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-ink">{percentage}</span>
        </div>
      </div>
      {label && <span className="text-sm text-mute mt-2">{label}</span>}
    </div>
  );
};

export default DonutChart;