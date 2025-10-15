import React from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  Settings, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { FloatingButton } from '../ui/floating-button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const kpiData = [
  { 
    title: 'Total Vehicles', 
    value: '1,247', 
    change: '+12%', 
    icon: Car, 
    gradient: 'green',
    description: 'Active fleet'
  },
  { 
    title: 'Spare Parts', 
    value: '15,683', 
    change: '+8%', 
    icon: Settings, 
    gradient: 'emerald',
    description: 'In inventory'
  },
  { 
    title: 'Monthly Revenue', 
    value: '$324,582', 
    change: '+23%', 
    icon: DollarSign, 
    gradient: 'lime',
    description: 'This month'
  },
  { 
    title: 'Active Rentals', 
    value: '89', 
    change: '+5%', 
    icon: Package, 
    gradient: 'dark-green',
    description: 'Currently rented'
  }
];

const chartData = [
  { name: 'Jan', sales: 4000, rentals: 2400, parts: 1200 },
  { name: 'Feb', sales: 3000, rentals: 1398, parts: 2210 },
  { name: 'Mar', sales: 2000, rentals: 9800, parts: 2290 },
  { name: 'Apr', sales: 2780, rentals: 3908, parts: 2000 },
  { name: 'May', sales: 1890, rentals: 4800, parts: 2181 },
  { name: 'Jun', sales: 2390, rentals: 3800, parts: 2500 }
];

const pieData = [
  { name: 'Available', value: 65, color: '#10b981' },
  { name: 'Rented', value: 25, color: '#059669' },
  { name: 'Maintenance', value: 10, color: '#84cc16' }
];

const recentActivities = [
  { id: 1, action: 'New rental booking', customer: 'John Doe', time: '2 min ago', type: 'rental' },
  { id: 2, action: 'Parts order completed', item: 'Engine Oil (20L)', time: '15 min ago', type: 'parts' },
  { id: 3, action: 'Vehicle sale finalized', vehicle: 'Toyota Camry 2023', time: '1 hour ago', type: 'sale' },
  { id: 4, action: 'Maintenance scheduled', vehicle: 'BMW X3', time: '2 hours ago', type: 'maintenance' }
];

export function Dashboard() {
  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard glow gradient={kpi.gradient as any} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white/60 text-sm mb-1">{kpi.description}</p>
                    <h3 className="text-white text-2xl mb-2">{kpi.value}</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">{kpi.change}</span>
                      <span className="text-white/50 text-sm">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${
                    kpi.gradient === 'green' ? 'from-green-500/20 to-emerald-500/20' :
                    kpi.gradient === 'emerald' ? 'from-emerald-500/20 to-teal-500/20' :
                    kpi.gradient === 'lime' ? 'from-lime-500/20 to-green-500/20' :
                    'from-green-700/20 to-green-900/20'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg">Revenue Trends</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-white/60 text-sm">Sales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-white/60 text-sm">Rentals</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" fill="rgba(16,185,129,0.2)" />
                  <Area type="monotone" dataKey="rentals" stroke="#059669" fill="rgba(5,150,105,0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Fleet Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-white text-lg mb-6">Fleet Status</h3>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-white/70 text-sm">{item.name}</span>
                  <span className="text-white text-sm">{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg">Recent Activities</h3>
            <button className="text-green-400 hover:text-green-300 text-sm transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ x: 4 }}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'rental' ? 'bg-green-400' :
                  activity.type === 'parts' ? 'bg-emerald-400' :
                  activity.type === 'sale' ? 'bg-lime-400' :
                  'bg-green-600'
                }`}></div>
                <div className="flex-1">
                  <p className="text-white/90">{activity.action}</p>
                  <p className="text-white/50 text-sm">
                    {activity.customer || activity.item || activity.vehicle}
                  </p>
                </div>
                <span className="text-white/50 text-sm">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <FloatingButton size="lg" onClick={() => console.log('Quick action')}>
          <Calendar className="w-6 h-6" />
        </FloatingButton>
      </motion.div>
    </div>
  );
}