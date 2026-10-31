import React, { useState } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Truck,
  CheckCircle,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import {
  useGetAdminStatsQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetDepartmentsQuery,
} from '../store/apiSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { openAuthModal, addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/utils';
import { OrderStatus } from '../types';

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const isAdminOrSeller = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SELLER');

  const { data: stats } = useGetAdminStatsQuery(undefined, { skip: !isAdminOrSeller });
  const { data: adminOrders } = useGetAdminOrdersQuery({ size: 30 }, { skip: !isAdminOrSeller });
  const { data: adminProducts } = useGetAdminProductsQuery({ size: 50 }, { skip: !isAdminOrSeller });
  const { data: departments } = useGetDepartmentsQuery(undefined, { skip: !isAdminOrSeller });

  const [updateOrderStatusApi] = useUpdateOrderStatusMutation();
  const [createProductApi] = useCreateProductMutation();
  const [updateProductApi] = useUpdateProductMutation();
  const [deleteProductApi] = useDeleteProductMutation();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State for Product Add / Edit
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('HomeNest');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formPrice, setFormPrice] = useState('14999');
  const [formComparePrice, setFormComparePrice] = useState('19999');
  const [formStock, setFormStock] = useState('15');
  const [formRoom, setFormRoom] = useState('Living Room');
  const [formStyle, setFormStyle] = useState('Mid-Century Modern');
  const [formColor, setFormColor] = useState('Walnut');
  const [formMaterial, setFormMaterial] = useState('Solid Wood');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');

  if (!isAdminOrSeller) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-purple-50 text-[#7b189f] rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Administrator / Merchant Portal</h2>
        <p className="text-xs text-gray-500">
          Sign in with admin credentials (<code className="text-[#7b189f]">admin@homenest.local</code> / <code className="text-[#7b189f]">Admin@12345</code>) to access store operations.
        </p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="px-6 py-2.5 rounded-full bg-[#7b189f] text-white text-xs font-bold hover:bg-[#581172] transition-colors"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('HomeNest');
    setFormPrice('14999');
    setFormComparePrice('19999');
    setFormStock('15');
    setFormRoom('Living Room');
    setFormStyle('Mid-Century Modern');
    setFormColor('Walnut');
    setFormMaterial('Solid Wood');
    setFormImageUrl('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80');
    setFormDescription('Artisan crafted with solid kiln-dried wood.');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand || 'HomeNest');
    setFormCategoryId(p.categoryId || 1);
    setFormPrice(p.price.toString());
    setFormComparePrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setFormStock(p.stock.toString());
    setFormRoom(p.room || 'Living Room');
    setFormStyle(p.style || 'Mid-Century Modern');
    setFormColor(p.color || 'Walnut');
    setFormMaterial(p.material || 'Solid Wood');
    setFormImageUrl(p.primaryImage || '');
    setFormDescription(p.description || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName.trim(),
      brand: formBrand.trim(),
      categoryId: formCategoryId,
      price: parseFloat(formPrice),
      compareAtPrice: formComparePrice ? parseFloat(formComparePrice) : null,
      stock: parseInt(formStock, 10),
      room: formRoom.trim(),
      style: formStyle.trim(),
      color: formColor.trim(),
      material: formMaterial.trim(),
      description: formDescription.trim(),
      images: formImageUrl.trim() ? [formImageUrl.trim()] : [],
    };

    try {
      if (editingProduct) {
        await updateProductApi({ id: editingProduct.id, data: payload }).unwrap();
        dispatch(addToast({ message: `Updated product "${payload.name}"`, type: 'success' }));
      } else {
        await createProductApi(payload).unwrap();
        dispatch(addToast({ message: `Created new product "${payload.name}"`, type: 'success' }));
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.detail || 'Failed to save product', type: 'error' }));
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Deactivate product "${name}"?`)) return;
    try {
      await deleteProductApi(id).unwrap();
      dispatch(addToast({ message: `Product "${name}" deactivated.`, type: 'info' }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.detail || 'Could not deactivate product', type: 'error' }));
    }
  };

  const handleStatusChange = async (reference: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusApi({ reference, status: newStatus }).unwrap();
      dispatch(addToast({ message: `Order #${reference} status updated to ${newStatus}`, type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.detail || 'Status update failed', type: 'error' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            HomeNest Merchant & Operations Portal
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Store management, live inventory tracking, and fulfillment workflow
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-[#7b189f] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Orders Placed</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.totalOrders || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Gross Revenue</p>
            <h3 className="text-2xl font-black text-gray-900">
              {formatCurrency(stats?.totalRevenue || 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Products</p>
            <h3 className="text-2xl font-black text-gray-900">{stats?.totalProducts || 0}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Low Stock Alerts</p>
            <h3 className="text-2xl font-black text-amber-600">{stats?.lowStockCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-[#7b189f] text-[#7b189f]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Product Inventory ({adminProducts?.totalElements || 0})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-[#7b189f] text-[#7b189f]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Orders Fulfillment ({adminOrders?.totalElements || 0})
        </button>
      </div>

      {/* Tab 1: Products Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Piece</th>
                  <th className="p-3.5">SKU / Brand</th>
                  <th className="p-3.5">Room & Style</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {adminProducts?.content?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-3.5 flex items-center space-x-3">
                      <img
                        src={p.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=80&q=80'}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                      />
                      <span className="font-bold text-gray-900 line-clamp-1 max-w-xs">{p.name}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] text-[#7b189f]">{p.sku}</div>
                      <div className="text-[11px] text-gray-400">{p.brand}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{p.room || 'Living Room'}</div>
                      <div className="text-[11px] text-gray-400">{p.style}</div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.stock <= 3
                            ? 'bg-rose-100 text-rose-700'
                            : p.stock <= 8
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-gray-500 hover:text-[#7b189f] rounded-lg hover:bg-purple-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Deactivate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Fulfillment Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Recipient & Destination</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Workflow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {adminOrders?.content?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#7b189f]">#{ord.reference}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{ord.shippingAddress?.fullName}</div>
                      <div className="text-[11px] text-gray-400">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                      </div>
                    </td>
                    <td className="p-3.5">{ord.items?.length || 1} pieces</td>
                    <td className="p-3.5 font-bold text-gray-900">{formatCurrency(ord.total)}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-emerald-700 uppercase">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.reference, e.target.value as any)}
                        className="text-xs font-bold py-1 px-2.5 rounded-lg border border-gray-200 bg-white focus:border-[#7b189f] focus:outline-hidden"
                      >
                        <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Furniture Piece' : 'Add New Home Piece'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Haven Mid-Century Velvet Armchair"
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Room Destination</label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden bg-white"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Kitchen">Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Compare-At Price (₹)</label>
                  <input
                    type="number"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Design Style</label>
                  <input
                    type="text"
                    value={formStyle}
                    onChange={(e) => setFormStyle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Color Finish</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Material</label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 font-bold text-white bg-[#7b189f] hover:bg-[#581172] rounded-lg shadow-md"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
