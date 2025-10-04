import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrdersByEmail } from '../lib/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Download,
  Star,
  MapPin,
  CreditCard,
  Calendar,
  Hash
} from 'lucide-react';

export default function OrdersPage({ onNavigate }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Loading orders for user:', currentUser.email);
        
        const userOrders = await getOrdersByEmail(currentUser.email);
        console.log('📦 Raw orders from Firebase:', userOrders);
        
        // Transform Firebase orders to match UI format
        const transformedOrders = userOrders.map(order => {
          console.log('🔄 Transforming order:', order);
          
          // Parse address if it's a combined string
          const parseAddress = (addressString) => {
            if (!addressString) return { street: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'N/A' };
            
            // Try to parse "street, city, state zipCode, country" format
            const parts = addressString.split(',').map(part => part.trim());
            if (parts.length >= 3) {
              const street = parts[0] || 'N/A';
              const city = parts[1] || 'N/A';
              const stateZip = parts[2] ? parts[2].split(' ') : [];
              const state = stateZip[0] || 'N/A';
              const zipCode = stateZip[1] || 'N/A';
              const country = parts[3] || 'N/A';
              
              return { street, city, state, zipCode, country };
            }
            
            // Fallback: use the whole string as street
            return { street: addressString, city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'N/A' };
          };
          
          const parsedAddress = parseAddress(order.Address);
          
          return {
            id: order.OrderID || order.id,
            date: order.createdAt || new Date().toISOString(),
            status: (order.Status || 'pending').toLowerCase(),
            total: parseFloat(order.TotalPrice || 0),
            shippingCost: parseFloat(order.ShippingCost || 0),
            items: [{
              id: order.id,
              name: order.productname || 'Unknown Product',
              image: order.productImg || order.ProductImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
              price: parseFloat(order.Price || 0),
              quantity: parseInt(order.Quantity || 1),
              color: order.Color || order.ProductColor || 'Default'
            }],
            shippingAddress: {
              name: order.FullName || 'N/A',
              street: parsedAddress.street,
              city: parsedAddress.city,
              state: parsedAddress.state,
              zipCode: parsedAddress.zipCode,
              country: parsedAddress.country
            },
            trackingNumber: order.TrackingNumber || null,
            estimatedDelivery: order.EstimatedDelivery || null,
            actualDelivery: order.ActualDelivery || null,
            cancellationReason: order.CancellationReason || null
          };
        });
        
        setOrders(transformedOrders);
        console.log('✅ Orders loaded:', transformedOrders.length);
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        console.error('❌ Error details:', error.message, error.code);
        setError(`Failed to load orders: ${error.message || 'Please try again.'}`);
        setOrders([]); // Set empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };


    loadOrders();
  }, [currentUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Calculate total spending
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const OrderCard = ({ order }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-4 w-4" />
              {order.id}
            </CardTitle>
            <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
              Ordered on {new Date(order.date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor(order.status)} mb-2`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <div className="text-sm space-y-1" style={{color: 'oklch(0.5 0.05 70)'}}>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${(order.total - (order.shippingCost || 0)).toFixed(2)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-medium">${order.shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1 mt-2">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold" style={{color: 'oklch(0.3 0.1 70)'}}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Order Items */}
        <div className="space-y-3 mb-4">
          <h5 className="font-medium mb-2 flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
            <Package className="h-4 w-4" />
            Order Items
          </h5>
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border" style={{backgroundColor: 'oklch(0.98 0.05 70)'}}>
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium" style={{color: 'oklch(0.3 0.1 70)'}}>
                  {item.name}
                </h4>
                <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                  Color: {item.color} • Qty: {item.quantity}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    ${item.price.toFixed(2)} each
                  </span>
                  <span className="text-sm font-semibold" style={{color: 'oklch(0.3 0.1 70)'}}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h5 className="font-medium mb-3 flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
            <CreditCard className="h-4 w-4" />
            Order Summary
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{color: 'oklch(0.5 0.05 70)'}}>Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)}):</span>
              <span className="font-medium">${(order.total - (order.shippingCost || 0)).toFixed(2)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between">
                <span style={{color: 'oklch(0.5 0.05 70)'}}>Shipping:</span>
                <span className="font-medium">${order.shippingCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold" style={{color: 'oklch(0.3 0.1 70)'}}>Total Paid:</span>
              <span className="text-lg font-bold" style={{color: 'oklch(0.3 0.1 70)'}}>
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h5 className="font-medium mb-2 flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h5>
            <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-2 flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
              {getStatusIcon(order.status)}
              Order Status
            </h5>
            <div className="space-y-1 text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
              {order.trackingNumber && (
                <p>Tracking: {order.trackingNumber}</p>
              )}
              {order.estimatedDelivery && (
                <p>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
              )}
              {order.actualDelivery && (
                <p>Delivered: {new Date(order.actualDelivery).toLocaleDateString()}</p>
              )}
              {order.cancellationReason && (
                <p className="text-red-600">Reason: {order.cancellationReason}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          {order.status === 'delivered' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Rate & Review
            </Button>
          )}
          {order.status === 'shipped' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Truck className="h-4 w-4" />
              Track Package
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Invoice
          </Button>
          {order.status === 'processing' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  // Not logged in state
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'oklch(0.95 0.1 70)'}}>
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4" style={{color: 'oklch(0.6 0.1 70)'}} />
            <h3 className="text-xl font-semibold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
              Please Sign In
            </h3>
            <p className="mb-6" style={{color: 'oklch(0.5 0.05 70)'}}>
              You need to be signed in to view your order history.
            </p>
            <Button 
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 mx-auto"
              style={{backgroundColor: 'oklch(0.7 0.15 70)', color: 'white'}}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'oklch(0.95 0.1 70)'}}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'oklch(0.95 0.1 70)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                My Orders
              </h1>
              <p className="text-lg" style={{color: 'oklch(0.5 0.05 70)'}}>
                Track and manage your order history
              </p>
            </div>
            <Button
              onClick={() => {
                setLoading(true);
                setError(null);
                // Trigger reload by updating a dependency
                const loadOrders = async () => {
                  try {
                    const userOrders = await getOrdersByEmail(currentUser.email);
                    console.log('🔄 Refreshed orders:', userOrders.length);
                    
                    const transformedOrders = userOrders.map(order => {
                      const parseAddress = (addressString) => {
                        if (!addressString) return { street: 'N/A', city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'N/A' };
                        const parts = addressString.split(',').map(part => part.trim());
                        if (parts.length >= 3) {
                          const street = parts[0] || 'N/A';
                          const city = parts[1] || 'N/A';
                          const stateZip = parts[2] ? parts[2].split(' ') : [];
                          const state = stateZip[0] || 'N/A';
                          const zipCode = stateZip[1] || 'N/A';
                          const country = parts[3] || 'N/A';
                          return { street, city, state, zipCode, country };
                        }
                        return { street: addressString, city: 'N/A', state: 'N/A', zipCode: 'N/A', country: 'N/A' };
                      };
                      
                      const parsedAddress = parseAddress(order.Address);
                      
                      return {
                        id: order.OrderID || order.id,
                        date: order.createdAt || new Date().toISOString(),
                        status: (order.Status || 'pending').toLowerCase(),
                        total: parseFloat(order.TotalPrice || 0),
                        shippingCost: parseFloat(order.ShippingCost || 0),
                        items: [{
                          id: order.id,
                          name: order.productname || 'Unknown Product',
                          image: order.productImg || order.ProductImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
                          price: parseFloat(order.Price || 0),
                          quantity: parseInt(order.Quantity || 1),
                          color: order.Color || order.ProductColor || 'Default'
                        }],
                        shippingAddress: {
                          name: order.FullName || 'N/A',
                          street: parsedAddress.street,
                          city: parsedAddress.city,
                          state: parsedAddress.state,
                          zipCode: parsedAddress.zipCode,
                          country: parsedAddress.country
                        },
                        trackingNumber: order.TrackingNumber || null,
                        estimatedDelivery: order.EstimatedDelivery || null,
                        actualDelivery: order.ActualDelivery || null,
                        cancellationReason: order.CancellationReason || null
                      };
                    });
                    
                    setOrders(transformedOrders);
                  } catch (error) {
                    console.error('❌ Error refreshing orders:', error);
                    setError(`Failed to refresh orders: ${error.message || 'Please try again.'}`);
                  } finally {
                    setLoading(false);
                  }
                };
                loadOrders();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Spending Summary */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{backgroundColor: 'oklch(0.9 0.1 70)'}}>
                  <CreditCard className="h-5 w-5" style={{color: 'oklch(0.4 0.1 70)'}} />
                </div>
                <div>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>Total Spent</p>
                  <p className="text-xl font-bold" style={{color: 'oklch(0.3 0.1 70)'}}>
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{backgroundColor: 'oklch(0.9 0.1 70)'}}>
                  <Package className="h-5 w-5" style={{color: 'oklch(0.4 0.1 70)'}} />
                </div>
                <div>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>Total Orders</p>
                  <p className="text-xl font-bold" style={{color: 'oklch(0.3 0.1 70)'}}>
                    {totalOrders}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{backgroundColor: 'oklch(0.9 0.1 70)'}}>
                  <Calendar className="h-5 w-5" style={{color: 'oklch(0.4 0.1 70)'}} />
                </div>
                <div>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>Avg Order Value</p>
                  <p className="text-xl font-bold" style={{color: 'oklch(0.3 0.1 70)'}}>
                    ${averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
                style={activeTab === tab.id ? {
                  backgroundColor: 'oklch(0.7 0.15 70)',
                  color: 'white'
                } : {}}
              >
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4" style={{color: 'oklch(0.6 0.1 70)'}} />
                <h3 className="text-xl font-semibold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                  No orders found
                </h3>
                <p className="mb-6" style={{color: 'oklch(0.5 0.05 70)'}}>
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet."
                    : `You don't have any ${activeTab} orders.`
                  }
                </p>
                <Button 
                  onClick={() => onNavigate('products')}
                  className="flex items-center gap-2"
                  style={{backgroundColor: 'oklch(0.7 0.15 70)', color: 'white'}}
                >
                  <Package className="h-4 w-4" />
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Stats */}
        {orders.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle style={{color: 'oklch(0.3 0.1 70)'}}>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{color: 'oklch(0.7 0.15 70)'}}>
                    {orders.length}
                  </p>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    Total Orders
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{color: 'oklch(0.7 0.15 70)'}}>
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    Total Spent
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{color: 'oklch(0.7 0.15 70)'}}>
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    Delivered
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{color: 'oklch(0.7 0.15 70)'}}>
                    {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                  </p>
                  <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    In Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
