import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/Button';
import { api } from '../services/api';
import {
  Package,
  Plus,
  Search,
  Download,
  Eye,
  Calendar,
  Building,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BatchInfo {
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
}

interface PackingListItem {
  productId: string;
  productName: string;
  brandName: string;
  genericName: string;
  strength: string;
  packSize: string;
  batches: BatchInfo[];
  totalQuantity: number;
  shipperQuantity: number;
  grossWeight: number;
  netWeight: number;
}

interface PackingList {
  id: string;
  packingListNumber: string;
  orderId: string;
  orderNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerName: string;
  customerCountry: string;
  shippingDate: string;
  manufacturingSite: string;
  status: 'draft' | 'confirmed' | 'shipped';
  // loaded only when viewing details
  items?: PackingListItem[];
  totalShippers: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  notes?: string;
}

const PackingLists: React.FC = () => {
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackingList, setSelectedPackingList] = useState<PackingList | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newOrderId, setNewOrderId] = useState('');
  const [newInvoiceId, setNewInvoiceId] = useState('');
  // available orders and invoices for creating packing list
  const [orders, setOrders] = useState<{ id: string; orderNumber: string }[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; invoiceNumber: string }[]>([]);

  // remove duplicate entries by a key function (preserves order)
  const uniqueBy = <T,>(arr: T[], keyFn: (t: T) => string): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of arr) {
      try {
        const k = keyFn(item);
        if (!seen.has(k)) { seen.add(k); out.push(item); }
      } catch (e) {
        // if key extraction fails, push item to avoid data loss
        out.push(item as T);
      }
    }
    return out;
  };

  // Fetch packing lists from API for table view
  const fetchPackingLists = async () => {
    setLoading(true);
    try {
      const lists = await api.get<PackingList[]>('/packing-list');
      setPackingLists(lists);
    } catch (err) {
      console.error('Error fetching packing lists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingLists();
  }, []);
  
  // fetch orders and invoices when opening create form
  useEffect(() => {
    if (showCreateForm) {
      (async () => {
        try {
          const [ordersData, invoicesData] = await Promise.all([
            api.get<{ id: string; orderNumber: string }[]>('/orders'),
            api.get<{ id: string; invoiceNumber: string }[]>('/invoices')
          ]);
          // deduplicate by id (fallback to number) to avoid duplicate dropdown entries
          setOrders(uniqueBy(ordersData, (o: any) => o.id ?? String(o.orderNumber ?? '')));
          setInvoices(uniqueBy(invoicesData, (i: any) => i.id ?? String(i.invoiceNumber ?? '')));
        } catch (err) {
          console.error('Error fetching orders/invoices:', err);
        }
      })();
    }
  }, [showCreateForm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/packing-list/generate', { orderId: newOrderId, invoiceId: newInvoiceId, items: [] });
      setShowCreateForm(false);
      fetchPackingLists();
    } catch (error) {
      console.error('Create packing list error', error);
    }
  };
  
  // Fetch full packing list details for modal
  const handleViewDetails = async (id: string) => {
    try {
      const detail = await api.get<PackingList>(`/packing-list/${id}`);
      setSelectedPackingList(detail);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching packing list details:', err);
    }
  };

  const handleDownloadPDF = async (packingListId: string) => {
    try {
      const response = await fetch(`/api/packing-list/${packingListId}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `packing-list-${packingListId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped': return 'text-emerald-400';
      case 'confirmed': return 'text-blue-400';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped': return <CheckCircle className="w-4 h-4" />;
      case 'confirmed': return <Package className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredPackingLists = packingLists.filter(pl => {
    const matchesSearch = pl.packingListNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pl.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pl.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-gray-800 p-4 rounded space-y-2">
            <h2 className="text-xl text-white">New Packing List</h2>
            {/* select order */}
            <select
              value={newOrderId}
              onChange={e => setNewOrderId(e.target.value)}
              className="p-2 w-full bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{ 
                backgroundColor: '#1f2937', 
                color: 'white',
                borderColor: '#4b5563'
              }}
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#d1d5db', padding: '8px' }}>Select Order</option>
              {orders.map(o => (
                <option key={o.id} value={o.id} style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>{o.orderNumber}</option>
              ))}
            </select>
            <select
              value={newInvoiceId}
              onChange={e => setNewInvoiceId(e.target.value)}
              className="p-2 w-full bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              style={{ 
                backgroundColor: '#1f2937', 
                color: 'white',
                borderColor: '#4b5563'
              }}
            >
              <option value="" style={{ backgroundColor: '#1f2937', color: '#d1d5db', padding: '8px' }}>Select Invoice (optional)</option>
              {invoices.map(i => (
                <option key={i.id} value={i.id} style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>{i.invoiceNumber}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">Packing Lists</h1>
          <p className="text-gray-400 mt-1">Manage shipment packing lists with batch details</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Packing List</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Packing Lists</p>
              <p className="text-2xl font-bold text-white">{packingLists.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-blue-400">
                {packingLists.filter(pl => pl.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Shipped</p>
              <p className="text-2xl font-bold text-emerald-400">
                {packingLists.filter(pl => pl.status === 'shipped').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Shippers</p>
              <p className="text-2xl font-bold text-purple-400">
                {packingLists.reduce((sum, pl) => sum + pl.totalShippers, 0)}
              </p>
            </div>
            <Layers className="w-8 h-8 text-purple-400" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by packing list number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            style={{ 
              backgroundColor: '#1f2937', 
              color: 'white',
              borderColor: '#4b5563'
            }}
          >
            <option value="all" style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>All Status</option>
            <option value="draft" style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>Draft</option>
            <option value="confirmed" style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>Confirmed</option>
            <option value="shipped" style={{ backgroundColor: '#1f2937', color: '#ffffff', padding: '8px' }}>Shipped</option>
          </select>
        </div>
      </GlassCard>

      {/* Packing Lists Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Packing List No.</th>
                <th className="text-left p-4 text-gray-400 font-medium">Order/Invoice</th>
                <th className="text-left p-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left p-4 text-gray-400 font-medium">Mfg Site</th>
                <th className="text-left p-4 text-gray-400 font-medium">Ship Date</th>
                <th className="text-left p-4 text-gray-400 font-medium">Shippers</th>
                <th className="text-left p-4 text-gray-400 font-medium">Weight (kg)</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-400">Loading...</td>
                </tr>
              ) : filteredPackingLists.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-400">No packing lists found</td>
                </tr>
              ) : (
                filteredPackingLists.map((packingList) => (
                  <motion.tr
                    key={packingList.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{packingList.packingListNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-300 text-sm">{packingList.orderNumber}</p>
                        {packingList.invoiceNumber && (
                          <p className="text-gray-500 text-xs">{packingList.invoiceNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{packingList.customerName}</p>
                        <p className="text-sm text-gray-400">{packingList.customerCountry}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{packingList.manufacturingSite}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(packingList.shippingDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{packingList.totalShippers}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">G: {packingList.totalGrossWeight}</p>
                        <p className="text-gray-400 text-sm">N: {packingList.totalNetWeight}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center space-x-2 ${getStatusColor(packingList.status)}`}>
                        {getStatusIcon(packingList.status)}
                        <span className="capitalize">{packingList.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(packingList.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(packingList.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Packing List Details Modal */}
      {showDetails && selectedPackingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-auto"
          >
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Packing List Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Packing List Number</p>
                    <p className="text-white font-medium">{selectedPackingList.packingListNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Manufacturing Site</p>
                    <p className="text-white">{selectedPackingList.manufacturingSite}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Shipping Date</p>
                    <p className="text-white">{new Date(selectedPackingList.shippingDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Items with Batch Details */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Product Details with Batch Information</h3>
                  <div className="space-y-4">
                    {selectedPackingList.items?.map((item, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-medium">{item.productName}</p>
                            <p className="text-gray-400 text-sm">{item.brandName} - {item.genericName}</p>
                            <p className="text-gray-400 text-sm">Pack Size: {item.packSize}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white">Total Qty: {item.totalQuantity}</p>
                            <p className="text-gray-400 text-sm">Shippers: {item.shipperQuantity}</p>
                          </div>
                        </div>
                        
                        {/* Batch Details Table */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-300 mb-2">Batch Details:</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left p-2 text-gray-400">Batch No.</th>
                                <th className="text-left p-2 text-gray-400">Mfg Date</th>
                                <th className="text-left p-2 text-gray-400">Expiry Date</th>
                                <th className="text-right p-2 text-gray-400">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.batches.map((batch, batchIndex) => (
                                <tr key={batchIndex} className="border-b border-white/5">
                                  <td className="p-2 text-white font-mono">{batch.batchNumber}</td>
                                  <td className="p-2 text-gray-300">{new Date(batch.manufacturingDate).toLocaleDateString()}</td>
                                  <td className="p-2 text-gray-300">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                                  <td className="p-2 text-right text-white">{batch.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Weight Info */}
                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-gray-400">Gross Weight: <span className="text-white">{item.grossWeight} kg</span></span>
                          <span className="text-gray-400">Net Weight: <span className="text-white">{item.netWeight} kg</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm">Total Shippers</p>
                      <p className="text-2xl font-bold text-white">{selectedPackingList.totalShippers}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Gross Weight</p>
                      <p className="text-2xl font-bold text-white">{selectedPackingList.totalGrossWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Net Weight</p>
                      <p className="text-2xl font-bold text-white">{selectedPackingList.totalNetWeight} kg</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleDownloadPDF(selectedPackingList.id)}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PackingLists;