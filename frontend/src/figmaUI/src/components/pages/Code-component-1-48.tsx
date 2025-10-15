import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Package, Plus, Search, Filter, Move, Zap, AlertTriangle, Truck } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { FloatingButton } from '../ui/floating-button';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';

interface YardItem {
  id: string;
  name: string;
  type: 'Vehicle' | 'Part' | 'Equipment';
  location: {
    zone: string;
    row: string;
    position: string;
  };
  status: 'Active' | 'Under Repair' | 'Ready to Move' | 'Scrapped';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  dateAdded: string;
  lastMoved: string;
  value: number;
  description: string;
}

const mockYardItems: YardItem[] = [
  {
    id: '1',
    name: 'Toyota Camry 2020',
    type: 'Vehicle',
    location: { zone: 'A', row: '3', position: '15' },
    status: 'Active',
    condition: 'Good',
    dateAdded: '2024-01-10',
    lastMoved: '2024-01-15',
    value: 18500,
    description: 'Accident damage to front end, engine intact'
  },
  {
    id: '2',
    name: 'BMW Engine Block',
    type: 'Part',
    location: { zone: 'B', row: '1', position: '8' },
    status: 'Ready to Move',
    condition: 'Excellent',
    dateAdded: '2024-01-12',
    lastMoved: '2024-01-12',
    value: 3200,
    description: '3.0L engine block, removed from 2019 BMW X5'
  },
  {
    id: '3',
    name: 'Hydraulic Lift',
    type: 'Equipment',
    location: { zone: 'C', row: '2', position: '5' },
    status: 'Under Repair',
    condition: 'Fair',
    dateAdded: '2023-12-20',
    lastMoved: '2024-01-08',
    value: 8500,
    description: 'Two-post lift, needs hydraulic seal replacement'
  },
  {
    id: '4',
    name: 'Mercedes Transmission',
    type: 'Part',
    location: { zone: 'A', row: '5', position: '22' },
    status: 'Active',
    condition: 'Good',
    dateAdded: '2024-01-18',
    lastMoved: '2024-01-18',
    value: 2800,
    description: '7-speed automatic transmission from 2021 Mercedes C-Class'
  },
  {
    id: '5',
    name: 'Ford F-150 2018',
    type: 'Vehicle',
    location: { zone: 'D', row: '1', position: '3' },
    status: 'Scrapped',
    condition: 'Poor',
    dateAdded: '2023-11-15',
    lastMoved: '2024-01-05',
    value: 1200,
    description: 'Total loss, salvaged for parts'
  }
];

const yardZones = [
  { id: 'A', name: 'Zone A - Vehicles', color: 'blue', items: 45 },
  { id: 'B', name: 'Zone B - Engine Parts', color: 'green', items: 128 },
  { id: 'C', name: 'Zone C - Equipment', color: 'purple', items: 23 },
  { id: 'D', name: 'Zone D - Scrap', color: 'red', items: 67 }
];

export function YardInventory() {
  const [yardItems, setYardItems] = useState<YardItem[]>(mockYardItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const filteredItems = yardItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesZone = !selectedZone || item.location.zone === selectedZone;
    return matchesSearch && matchesType && matchesStatus && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Under Repair': return 'yellow';
      case 'Ready to Move': return 'blue';
      case 'Scrapped': return 'red';
      default: return 'gray';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Fair': return 'yellow';
      case 'Poor': return 'red';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Vehicle': return Truck;
      case 'Part': return Package;
      case 'Equipment': return Zap;
      default: return Package;
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
          <h1 className="text-2xl text-white mb-2">Yard Inventory</h1>
          <p className="text-white/60">Track and manage items in your vehicle yard</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {showMap ? 'List View' : 'Yard Map'}
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </motion.div>

      {/* Zone Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {yardZones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard 
                className={`p-4 cursor-pointer transition-all ${selectedZone === zone.id ? 'ring-2 ring-cyan-400' : ''}`}
                hover
                gradient={zone.color as any}
                onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white">{zone.name}</h3>
                    <p className="text-white/60 text-sm">{zone.items} items</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-${zone.color}-400`}></div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <Package className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Vehicle">Vehicles</SelectItem>
                <SelectItem value="Part">Parts</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Under Repair">Under Repair</SelectItem>
                <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                <SelectItem value="Scrapped">Scrapped</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-white/60">
              <span className="text-sm">Showing:</span>
              <span className="text-cyan-400 text-sm">{filteredItems.length} items</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {showMap ? (
        /* Yard Map View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 h-96">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white text-lg mb-2">Interactive Yard Map</h3>
                <p className="text-white/60">Drag and drop functionality would be implemented here</p>
                <p className="text-white/40 text-sm mt-2">Click and drag items to move them between zones</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        /* Items List View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <GlassCard 
                    className="p-6 group cursor-pointer"
                    hover
                    gradient={item.status === 'Active' ? 'green' : item.status === 'Under Repair' ? 'yellow' : 'blue'}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white text-lg">{item.name}</h3>
                          <p className="text-white/60 text-sm">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getStatusColor(item.status)}-500/20 text-${getStatusColor(item.status)}-400 border-${getStatusColor(item.status)}-400/30`}
                        >
                          {item.status}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`bg-${getConditionColor(item.condition)}-500/20 text-${getConditionColor(item.condition)}-400 border-${getConditionColor(item.condition)}-400/30`}
                        >
                          {item.condition}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Location:</span>
                        <span className="text-white">
                          Zone {item.location.zone}-{item.location.row}-{item.location.position}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Value:</span>
                        <span className="text-white text-lg">${item.value.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Date Added:</span>
                        <span className="text-white">{item.dateAdded}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Last Moved:</span>
                        <span className="text-white">{item.lastMoved}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-white/90 text-sm">{item.description}</p>
                    </div>

                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                      >
                        <Move className="w-4 h-4 mr-2" />
                        Move
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                      >
                        Edit
                      </Button>
                      {item.status === 'Under Repair' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Yard Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">Item Name</Label>
                <Input 
                  placeholder="Enter item name"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/90">Type</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Part">Part</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white/90">Zone</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Zone A</SelectItem>
                    <SelectItem value="B">Zone B</SelectItem>
                    <SelectItem value="C">Zone C</SelectItem>
                    <SelectItem value="D">Zone D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/90">Row</Label>
                <Input 
                  placeholder="Row"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/90">Position</Label>
                <Input 
                  placeholder="Position"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">Condition</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/90">Value ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/90">Description</Label>
              <Input 
                placeholder="Item description"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                Add Item
              </Button>
            </div>
          </div>
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
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
        >
          <Plus className="w-6 h-6" />
        </FloatingButton>
      </motion.div>
    </div>
  );
}