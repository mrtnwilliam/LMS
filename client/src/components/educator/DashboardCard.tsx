interface DashboardCardProps {
  icon: string;
  alt: string;
  value: string | number;
  label: string;
  currency?: string;
}

const DashboardCard = ({
  icon,
  alt,
  value,
  label,
  currency,
}: DashboardCardProps) => {
  return (
    <div className="flex items-center gap-3 shadow-card border border-blue-500 p-3.5 w-56 rounded-md">
      <img src={icon} alt={alt} />
      <div>
        <p className="text-2xl font-medium text-gray-600">
          {currency && currency}
          {value}
        </p>
        <p className="text-base text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
