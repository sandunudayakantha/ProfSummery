import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { FloatingButton } from '../ui/floating-button';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SparePart {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  supplier: string;
  location: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const mockParts: SparePart[] = [
  {
    id: '1',
    name: 'Engine Oil 5W-30',
    category: 'Lubricants',
    price: 45.99,
    stock: 127,
    minStock: 50,
    supplier: 'AutoParts Inc.',
    location: 'A-12-B',
    status: 'In Stock'
  },
  {
    id: '2',
    name: 'Brake Pads (Front)',
    category: 'Brakes',
    price: 89.99,
    stock: 23,
    minStock: 25,
    supplier: 'BrakeMax',
    location: 'B-08-A',
    status: 'Low Stock'
  },
  {
    id: '3',
    name: 'Air Filter',
    category: 'Engine',
    price: 24.99,
    stock: 0,
    minStock: 20,
    supplier: 'FilterPro',
    location: 'C-15-C',
    status: 'Out of Stock'
  },
  {
    id: '4',
    name: 'Spark Plugs (Set of 4)',
    category: 'Engine',
    price: 32.99,
    stock: 89,
    minStock: 30,
    supplier: 'IgnitionPlus',
    location: 'A-05-D',
    status: 'In Stock'
  },
  {
    id: '5',
    name: 'Timing Belt',
    category: 'Engine',
    price: 156.99,
    stock: 15,
    minStock: 10,
    supplier: 'TimingTech',
    location: 'D-03-A',
    status: 'In Stock'
  }
];

export function SpareParts() {
  const [parts, setParts] = useState<SparePart[]>(mockParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          part.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(parts.map(part => part.category)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'green';
      case 'Low Stock': return 'yellow';
      case 'Out of Stock': return 'red';
      default: return 'gray';
    }
  };

  const handleDelete = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl text-white mb-2">Spare Parts Inventory</h1>
          <p className="text-white/60">Manage your vehicle spare parts and inventory</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Part
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search parts, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>
      </motion.div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredParts.map((part, index) => (
            <motion.div
              key={part.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <GlassCard 
                className="p-6 group cursor-pointer"
                hover
                gradient={part.status === 'Out of Stock' ? 'red' : part.status === 'Low Stock' ? 'emerald' : 'green'}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white text-lg">{part.name}</h3>
                      <p className="text-white/60 text-sm">{part.category}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`bg-${getStatusColor(part.status)}-500/20 text-${getStatusColor(part.status)}-400 border-${getStatusColor(part.status)}-400/30`}
                  >
                    {part.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Price:</span>
                    <span className="text-white text-lg">${part.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Stock:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{part.stock}</span>
                      {part.stock <= part.minStock && (
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Location:</span>
                    <span className="text-white">{part.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Supplier:</span>
                    <span className="text-white text-sm">{part.supplier}</span>
                  </div>
                </div>

                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPart(part)}
                    className="flex-1 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(part.id)}
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || !!editingPart} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setEditingPart(null);
        }
      }}>
        <DialogContent className="bg-slate-900/90 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPart ? 'Edit Spare Part' : 'Add New Spare Part'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">Part Name</Label>
                <Input 
                  placeholder="Enter part name"
                  className="bg-white/5 border-white/20 text-white"
                  defaultValue={editingPart?.name}
                />
              </div>
              <div>
                <Label className="text-white/90">Category</Label>
                <Select defaultValue={editingPart?.category}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engine">Engine</SelectItem>
                    <SelectItem value="Brakes">Brakes</SelectItem>
                    <SelectItem value="Lubricants">Lubricants</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">Price ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  className="bg-white/5 border-white/20 text-white"
                  defaultValue={editingPart?.price}
                />
              </div>
              <div>
                <Label className="text-white/90">Stock Quantity</Label>
                <Input 
                  type="number"
                  placeholder="0"
                  className="bg-white/5 border-white/20 text-white"
                  defaultValue={editingPart?.stock}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/90">Supplier</Label>
                <Input 
                  placeholder="Supplier name"
                  className="bg-white/5 border-white/20 text-white"
                  defaultValue={editingPart?.supplier}
                />
              </div>
              <div>
                <Label className="text-white/90">Location</Label>
                <Input 
                  placeholder="e.g., A-12-B"
                  className="bg-white/5 border-white/20 text-white"
                  defaultValue={editingPart?.location}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPart(null);
                }}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                {editingPart ? 'Update Part' : 'Add Part'}
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