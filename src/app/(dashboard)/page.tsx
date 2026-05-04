import { TopBar } from "@/components/layout/TopBar";
import { 
  TrendingUp, 
  Monitor, 
  ShoppingCart, 
  ShieldCheck,
  Download,
  Plus,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { cn } from "@/lib/utils";

const kpis = [
  {
    title: "Total Sales",
    value: "$128,430.50",
    change: "+12.4%",
    comparison: "vs. $114,240 last month",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary-container/10",
    changeColor: "text-green-600 bg-green-50"
  },
  {
    title: "Active Terminals",
    value: "1,248",
    change: "Stable",
    comparison: "98% uptime across all zones",
    icon: Monitor,
    color: "text-secondary",
    bgColor: "bg-secondary-container/30",
    changeColor: "text-blue-600 bg-blue-50"
  },
  {
    title: "Avg Transaction Value",
    value: "$42.15",
    change: "+4.2%",
    comparison: "Global average per terminal",
    icon: ShoppingCart,
    color: "text-tertiary",
    bgColor: "bg-tertiary-container/10",
    changeColor: "text-green-600 bg-green-50"
  }
];

const activity = [
  {
    title: "New Terminal Activated",
    subtitle: "Central Mall, London - Store #42",
    time: "2 minutes ago",
    color: "bg-green-500",
    ringColor: "ring-green-100"
  },
  {
    title: "Bulk Payment Processed",
    subtitle: "High Street Hub - $4,200.00",
    time: "45 minutes ago",
    color: "bg-blue-500",
    ringColor: "ring-blue-100"
  },
  {
    title: "System Alert: Offline",
    subtitle: "North Station Kiosk #3",
    time: "1 hour ago",
    color: "bg-error",
    ringColor: "ring-error-container"
  },
  {
    title: "Software Update",
    subtitle: "Firmware v2.4.1 deployed",
    time: "3 hours ago",
    color: "bg-slate-300",
    ringColor: "ring-slate-100"
  }
];

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Executive Dashboard" />
      
      <main className="p-lg space-y-lg max-w-[1440px] mx-auto w-full">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {kpis.map((kpi) => (
            <div key={kpi.title} className="bg-white border border-outline-variant p-md rounded-xl hover:bg-surface-container-low transition-colors">
              <div className="flex justify-between items-start mb-md">
                <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <span className={cn("text-label-sm px-2 py-0.5 rounded-full", kpi.changeColor)}>
                  {kpi.change}
                </span>
              </div>
              <p className="text-label-md text-on-surface-variant mb-1">{kpi.title}</p>
              <h2 className="text-h1 text-on-surface">{kpi.value}</h2>
              <p className="text-label-sm text-outline mt-md">{kpi.comparison}</p>
            </div>
          ))}
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-12 gap-md items-stretch">
          {/* Main Chart Section */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-xl p-lg">
            <div className="flex justify-between items-center mb-xl">
              <div>
                <h3 className="text-h3 text-on-surface">Sales Trends</h3>
                <p className="text-body-md text-on-surface-variant">Transaction volume over the last 30 days</p>
              </div>
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button className="px-3 py-1 text-label-md bg-white rounded-md shadow-sm">Daily</button>
                <button className="px-3 py-1 text-label-md text-on-surface-variant">Weekly</button>
              </div>
            </div>
            
            {/* Visual Chart Simulation */}
            <div className="h-64 relative overflow-hidden rounded-lg bg-surface-container-low/50">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                {[0.6, 0.4, 0.7, 0.3, 0.5, 0.8, 0.7, 1.0, 0.9].map((height, i) => (
                  <div 
                    key={i} 
                    className="w-1/12 bg-primary-container rounded-t transition-all hover:bg-primary"
                    style={{ height: `${height * 100}%`, opacity: height * 0.8 }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-xl pt-lg border-t border-outline-variant">
              <div>
                <p className="text-label-sm text-outline uppercase tracking-wider mb-1">Peak Hour</p>
                <p className="text-h3">12:45 PM</p>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase tracking-wider mb-1">Busiest Day</p>
                <p className="text-h3">Friday</p>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase tracking-wider mb-1">Processing Delay</p>
                <p className="text-h3">0.4s</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-xl p-lg">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-h3 text-on-surface">Recent Activity</h3>
              <button className="text-primary text-label-md font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-md relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-low">
              {activity.map((item, i) => (
                <div key={i} className="relative pl-8">
                  <div className={cn(
                    "absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white ring-1",
                    item.color,
                    item.ringColor
                  )}></div>
                  <p className="text-body-md font-semibold">{item.title}</p>
                  <p className="text-label-md text-on-surface-variant">{item.subtitle}</p>
                  <span className="text-label-sm text-outline">{item.time}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-lg">
              <div className="bg-surface-container-low rounded-xl p-md flex items-center gap-md">
                <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center border border-outline-variant shrink-0 shadow-sm">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-label-md font-bold">Security Status</p>
                  <p className="text-label-sm text-on-surface-variant">All encryptions active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-margin right-margin w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
          <Plus className="w-6 h-6" />
        </button>
      </main>
    </>
  );
}
