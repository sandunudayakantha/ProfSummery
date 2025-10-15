import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Car, User, Clock, MapPin, DollarSign, Plus, Filter } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { FloatingButton } from '../ui/floating-button';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Rental {
  id: string;
  customerName: string;
  customerEmail: string;
  vehicleModel: string;
  vehiclePlate: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  pickupLocation: string;
  returnLocation: string;
}

const mockRentals: Rental[] = [
  {
    id: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    vehicleModel: 'Toyota Camry 2023',
    vehiclePlate: 'ABC-123',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    dailyRate: 89,
    totalAmount: 445,
    status: 'Active',
    pickupLocation: 'Downtown Branch',
    returnLocation: 'Airport Branch'
  },
  {
    id: '2',
    customerName: 'Sarah Smith',
    customerEmail: 'sarah@example.com',
    vehicleModel: 'Honda CR-V 2023',
    vehiclePlate: 'XYZ-789',
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    dailyRate: 95,
    totalAmount: 665,
    status: 'Pending',
    pickupLocation: 'Mall Branch',
    returnLocation: 'Downtown Branch'
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    vehicleModel: 'BMW X3 2022',
    vehiclePlate: 'LMN-456',
    startDate: '2024-01-10',
    endDate: '2024-01-14',
    dailyRate: 125,
    totalAmount: 500,
    status: 'Completed',
    pickupLocation: 'Airport Branch',
    returnLocation: 'Airport Branch'
  }
];

const availableVehicles = [
  { id: '1', model: 'Toyota Camry 2023', plate: 'ABC-123', dailyRate: 89, status: 'Available' },
  { id: '2', model: 'Honda CR-V 2023', plate: 'XYZ-789', dailyRate: 95, status: 'Rented' },
  { id: '3', model: 'BMW X3 2022', plate: 'LMN-456', dailyRate: 125, status: 'Available' },
  { id: '4', model: 'Mercedes GLA 2023', plate: 'QRS-101', dailyRate: 145, status: 'Maintenance' },
  { id: '5', model: 'Audi Q5 2022', plate: 'TUV-202', dailyRate: 135, status: 'Available' }
];

export function Rentals() {
  const [rentals, setRentals] = useState<Rental[]>(mockRentals);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRentals = rentals.filter(rental => {
    return statusFilter === 'all' || rental.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Pending': return 'yellow';
      case 'Completed': return 'blue';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Rented': return 'blue';
      case 'Maintenance': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl text-white mb-2">Vehicle Rentals</h1>
          <p className="text-white/60">Manage rental bookings and track vehicle availability</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}>
            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 text-sm">Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          </motion.div>

          {/* Rentals List */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredRentals.map((rental, index) => (
                  <motion.div
                    key={rental.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <GlassCard 
                      className="p-6 group cursor-pointer"
                      hover
                      gradient={rental.status === 'Active' ? 'lime' : rental.status === 'Pending' ? 'emerald' : 'green'}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-white/10">
                            <Car className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white text-lg">{rental.vehicleModel}</h3>
                            <p className="text-white/60">Plate: {rental.vehiclePlate}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getStatusColor(rental.status)}-500/20 text-${getStatusColor(rental.status)}-400 border-${getStatusColor(rental.status)}-400/30`}
                        >
                          {rental.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-white/60" />
                            <span className="text-white/90">{rental.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white/90">{rental.startDate} - {rental.endDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-white/60" />
                            <span className="text-white/90">{rental.pickupLocation}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Daily Rate:</span>
                            <span className="text-white">${rental.dailyRate}/day</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Total Amount:</span>
                            <span className="text-white text-lg">${rental.totalAmount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Return Location:</span>
                            <span className="text-white/90 text-sm">{rental.returnLocation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                        >
                          Modify
                        </Button>
                        {rental.status === 'Pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg">Rental Calendar</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white/60 text-sm">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-white/60 text-sm">Rented</span>
                    </div>
                  </div>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg"
                />
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Available Vehicles */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-white text-lg mb-4">Available Vehicles</h3>
              <div className="space-y-3">
                {availableVehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle.id}
                    whileHover={{ x: 4 }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/90 text-sm">{vehicle.model}</p>
                        <p className="text-white/50 text-xs">{vehicle.plate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">${vehicle.dailyRate}/day</p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs bg-${getVehicleStatusColor(vehicle.status)}-500/20 text-${getVehicleStatusColor(vehicle.status)}-400 border-${getVehicleStatusColor(vehicle.status)}-400/30`}
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-white text-lg mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Active Rentals</span>
                  <span className="text-green-400 text-xl">
                    {rentals.filter(r => r.status === 'Active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Pending Bookings</span>
                  <span className="text-lime-400 text-xl">
                    {rentals.filter(r => r.status === 'Pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Available Vehicles</span>
                  <span className="text-emerald-400 text-xl">
                    {availableVehicles.filter(v => v.status === 'Available').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Monthly Revenue</span>
                  <span className="text-white text-xl">$12,450</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <FloatingButton 
          size="lg" 
          variant="primary"
        >
          <Plus className="w-6 h-6" />
        </FloatingButton>
      </motion.div>
    </div>
  );
}