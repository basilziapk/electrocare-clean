import { Card, CardContent } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'destructive';
  trend?: string;
}

export default function DashboardCard({ title, value, icon, color, trend }: DashboardCardProps) {
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-green-100 text-green-600',
    accent: 'bg-yellow-100 text-yellow-600',
    destructive: 'bg-red-100 text-red-600',
  };

  const trendColorClasses = {
    primary: 'text-green-600',
    secondary: 'text-green-600', 
    accent: trend?.includes('High') || trend?.includes('attention') ? 'text-orange-600' : 'text-green-600',
    destructive: trend?.includes('control') ? 'text-green-600' : 'text-red-600',
  };

  return (
    <Card className="hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 border-0 bg-white group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium mb-1 group-hover:text-gray-800 transition-colors duration-200">{title}</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{value}</p>
          </div>
          <div className={`p-4 rounded-full ${colorClasses[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out`}>
            <i className={`${icon} text-xl group-hover:scale-110 transition-transform duration-300`}></i>
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${trendColorClasses[color]} group-hover:scale-105 transition-all duration-200`}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
