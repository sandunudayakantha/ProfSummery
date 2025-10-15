import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, DollarSign, Eye, Heart, Filter, Search, Grid, List, Plus } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { FloatingButton } from '../ui/floating-button';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  status: 'Available' | 'Sold' | 'Reserved' | 'Under Review';
  images: string[];
  features: string[];
  description: string;
  vin: string;
  engine: string;
  drivetrain: string;
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 28500,
    mileage: 15000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Silver',
    status: 'Available',
    images: ['car1.jpg', 'car1-2.jpg'],
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Heated Seats'],
    description: 'Excellent condition Toyota Camry with low mileage and full service history.',
    vin: 'JT2BF28K3X0123456',
    engine: '2.5L 4-Cylinder',
    drivetrain: 'FWD'
  },
  {
    id: '2',
    make: 'BMW',
    model: 'X3',
    year: 2022,
    price: 45900,
    mileage: 22000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Black',
    status: 'Available',
    images: ['car2.jpg'],
    features: ['Navigation', 'Leather Seats', 'Sunroof', 'Premium Audio'],
    description: 'Luxury SUV with premium features and excellent performance.',
    vin: 'WBAXG1C54DD123456',
    engine: '2.0L Turbo',
    drivetrain: 'AWD'
  },
  {
    id: '3',
    make: 'Honda',
    model: 'CR-V',
    year: 2023,
    price: 32000,
    mileage: 8500,
    fuelType: 'Gasoline',
    transmission: 'CVT',
    color: 'White',
    status: 'Reserved',
    images: ['car3.jpg'],
    features: ['Honda Sensing', 'Apple CarPlay', 'All-Wheel Drive'],
    description: 'Nearly new Honda CR-V with advanced safety features.',
    vin: 'JHLRD2H85KC123456',
    engine: '1.5L Turbo',
    drivetrain: 'AWD'
  },
  {
    id: '4',
    make: 'Mercedes',
    model: 'GLA 250',
    year: 2022,
    price: 38500,
    mileage: 18000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Red',
    status: 'Sold',
    images: ['car4.jpg'],
    features: ['MBUX Infotainment', 'LED Headlights', 'Panoramic Roof'],
    description: 'Compact luxury SUV with modern technology and style.',
    vin: 'WDC1J4KB4KF123456',
    engine: '2.0L Turbo',
    drivetrain: 'AWD'
  }
];

export function Sales() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'under30k' && vehicle.price < 30000) ||
                        (priceRange === '30k-50k' && vehicle.price >= 30000 && vehicle.price <= 50000) ||
                        (priceRange === 'over50k' && vehicle.price > 50000);
    return matchesSearch && matchesStatus && matchesPrice;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Reserved': return 'yellow';
      case 'Sold': return 'blue';
      case 'Under Review': return 'purple';
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
          <h1 className="text-2xl text-white mb-2">Vehicle Sales</h1>
          <p className="text-white/60">Browse and manage vehicle inventory for sale</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-cyan-500 hover:bg-cyan-600' : 'text-white/70 hover:text-white'}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-cyan-500 hover:bg-cyan-600' : 'text-white/70 hover:text-white'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under30k">Under $30k</SelectItem>
                <SelectItem value="30k-50k">$30k - $50k</SelectItem>
                <SelectItem value="over50k">Over $50k</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-white/60">
              <span className="text-sm">Found:</span>
              <span className="text-green-400 text-sm">{filteredVehicles.length} vehicles</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Vehicle Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <GlassCard 
                className={`group cursor-pointer overflow-hidden ${viewMode === 'grid' ? 'p-0' : 'p-6'}`}
                hover
                gradient={vehicle.status === 'Available' ? 'green' : vehicle.status === 'Reserved' ? 'purple' : 'blue'}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Vehicle Image */}
                    <div className="relative h-48 bg-gradient-to-r from-slate-800 to-slate-700 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Car className="w-16 h-16 text-white/20" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getStatusColor(vehicle.status)}-500/20 text-${getStatusColor(vehicle.status)}-400 border-${getStatusColor(vehicle.status)}-400/30`}
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="absolute top-4 left-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-white/60 text-sm">{vehicle.mileage.toLocaleString()} miles • {vehicle.color}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-xl">${vehicle.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Engine:</span>
                          <span className="text-white/90">{vehicle.engine}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Transmission:</span>
                          <span className="text-white/90">{vehicle.transmission}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Fuel Type:</span>
                          <span className="text-white/90">{vehicle.fuelType}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          onClick={() => setSelectedVehicle(vehicle)}
                          className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-400/30"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-16 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                          <p className="text-white/60 text-sm">{vehicle.mileage.toLocaleString()} miles • {vehicle.engine} • {vehicle.color}</p>
                        </div>
                        <div className="text-right flex items-center space-x-4">
                          <div>
                            <p className="text-white text-xl">${vehicle.price.toLocaleString()}</p>
                            <Badge 
                              variant="secondary" 
                              className={`bg-${getStatusColor(vehicle.status)}-500/20 text-${getStatusColor(vehicle.status)}-400 border-${getStatusColor(vehicle.status)}-400/30`}
                            >
                              {vehicle.status}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-400/30"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Vehicle Details Modal */}
      <Dialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Vehicle Image */}
                <div className="h-64 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg flex items-center justify-center">
                  <Car className="w-24 h-24 text-white/20" />
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/5">
                    <TabsTrigger value="overview" className="text-white data-[state=active]:bg-cyan-500/20">Overview</TabsTrigger>
                    <TabsTrigger value="specs" className="text-white data-[state=active]:bg-cyan-500/20">Specs</TabsTrigger>
                    <TabsTrigger value="features" className="text-white data-[state=active]:bg-cyan-500/20">Features</TabsTrigger>
                    <TabsTrigger value="history" className="text-white data-[state=active]:bg-cyan-500/20">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-white/60 text-sm">Price</p>
                        <p className="text-white text-2xl">${selectedVehicle.price.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/60 text-sm">Status</p>
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getStatusColor(selectedVehicle.status)}-500/20 text-${getStatusColor(selectedVehicle.status)}-400 border-${getStatusColor(selectedVehicle.status)}-400/30`}
                        >
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-2">Description</p>
                      <p className="text-white/90">{selectedVehicle.description}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specs" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">Engine:</span>
                          <span className="text-white">{selectedVehicle.engine}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Transmission:</span>
                          <span className="text-white">{selectedVehicle.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Drivetrain:</span>
                          <span className="text-white">{selectedVehicle.drivetrain}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">Fuel Type:</span>
                          <span className="text-white">{selectedVehicle.fuelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Mileage:</span>
                          <span className="text-white">{selectedVehicle.mileage.toLocaleString()} miles</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">VIN:</span>
                          <span className="text-white text-sm">{selectedVehicle.vin}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedVehicle.features.map((feature, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded-lg">
                          <span className="text-white/90 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <p className="text-white/60">Vehicle history and maintenance records would be displayed here.</p>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedVehicle(null)}
                    className="text-white/70 hover:text-white"
                  >
                    Close
                  </Button>
                  {selectedVehicle.status === 'Available' && (
                    <>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                        Reserve
                      </Button>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        Buy Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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