import { TopBar } from "@/components/layout/TopBar";
import { 
  Calendar, 
  FileDown, 
  TrendingUp, 
  TrendingDown, 
  MapPin,
  ChevronRight,
  Filter,
  MoreVertical
} from 'lucide-react';
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Sales", value: "$124,592.00", change: "12%", trend: "up" },
  { label: "Transactions", value: "3,842", change: "8%", trend: "up" },
  { label: "Active Terminals", value: "48 / 50", change: "96%", trend: "stable" },
  { label: "Net Profit", value: "$34,210.50", change: "2%", trend: "down" },
];

const locations = [
  { name: "New York City, NY", value: "$42,390", percentage: 85 },
  { name: "Los Angeles, CA", value: "$38,210", percentage: 76 },
  { name: "Chicago, IL", value: "$24,500", percentage: 49 },
  { name: "Houston, TX", value: "$19,492", percentage: 38 },
];

export default function AnalyticsPage() {
  return (
    <>
      <TopBar title="Analytics Overview" />
      
      <div className="p-lg space-y-lg">
        {/* Header with Date Range */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-outline-variant shadow-sm">
            <Calendar className="w-4 h-4 text-on-surface-variant mr-2" />
            <span className="text-label-md text-on-surface-variant">Oct 1, 2023 - Oct 31, 2023</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-primary font-semibold rounded-lg hover:bg-surface-container-low transition-colors">
            <FileDown className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-md border border-outline-variant rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center",
                  stat.trend === 'up' && "text-green-600 bg-green-50",
                  stat.trend === 'down' && "text-error bg-error-container",
                  stat.trend === 'stable' && "text-on-surface-variant bg-surface-container-low"
                )}>
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {stat.trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {stat.change}
                </span>
              </div>
              <div className="text-h1 text-on-surface">{stat.value}</div>
            </div>
          ))}
        </section>

        {/* Charts & Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 bg-white p-lg border border-outline-variant rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3 className="text-on-surface">Sales by Location</h3>
                <p className="text-body-md text-on-surface-variant">Regional performance tracking</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {locations.map((loc) => (
                <div key={loc.name} className="space-y-2">
                  <div className="flex justify-between text-label-md">
                    <span className="text-on-surface">{loc.name}</span>
                    <span className="font-bold">{loc.value}</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${loc.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-lg border border-outline-variant rounded-xl shadow-sm flex flex-col">
            <h3 className="text-on-surface mb-2">Product Categories</h3>
            <p className="text-body-md text-on-surface-variant mb-lg">Revenue split by type</p>
            
            <div className="flex-1 flex flex-col items-center justify-center relative py-xl">
              <div className="w-48 h-48 rounded-full border-[18px] border-surface-container flex items-center justify-center relative">
                {/* Simplified CSS Circle for preview */}
                <div className="absolute inset-0 border-[18px] border-primary border-r-transparent border-b-transparent rounded-full rotate-45"></div>
                <div className="text-center">
                  <div className="text-h1 font-bold text-on-surface">74%</div>
                  <div className="text-label-sm text-outline uppercase">Core Goods</div>
                </div>
              </div>
              
              <div className="mt-xl w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-body-md">Electronics</span>
                  </div>
                  <span className="text-label-md font-bold">42%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                    <span className="text-body-md">Home Goods</span>
                  </div>
                  <span className="text-label-md font-bold">32%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
