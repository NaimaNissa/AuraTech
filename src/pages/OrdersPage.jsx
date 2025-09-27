import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, ORDER_STATUS } from '../lib/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
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

  // Load user orders
  useEffect(() => {
    const loadOrders = async () => {
      if (currentUser) {
        try {
          const userOrders = await getUserOrders(currentUser.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error loading orders:', error);
          // Fallback to mock data for demo
          loadMockOrders();
        }
      }
    };

    const loadMockOrders = () => {
      const mockOrders = [
      {
        id: 'ORD-2024-001',
        date: '2024-01-20',
        status: 'delivered',
        total: 299.99,
        items: [
          {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            image: '/api/placeholder/80/80',
            price: 149.99,
            quantity: 1,
            color: 'Black'
          },
          {
            id: 2,
            name: 'Smart Watch Series 8',
            image: '/api/placeholder/80/80',
            price: 149.99,
            quantity: 1,
            color: 'Silver'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2024-01-25',
        actualDelivery: '2024-01-24'
      },
      {
        id: 'ORD-2024-002',
        date: '2024-01-18',
        status: 'shipped',
        total: 199.99,
        items: [
          {
            id: 3,
            name: 'Gaming Mechanical Keyboard',
            image: '/api/placeholder/80/80',
            price: 199.99,
            quantity: 1,
            color: 'RGB'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        trackingNumber: 'TRK987654321',
        estimatedDelivery: '2024-01-28'
      },
      {
        id: 'ORD-2024-003',
        date: '2024-01-15',
        status: 'processing',
        total: 89.99,
        items: [
          {
            id: 4,
            name: 'USB-C Hub with 4K HDMI',
            image: '/api/placeholder/80/80',
            price: 89.99,
            quantity: 1,
            color: 'Space Gray'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        estimatedDelivery: '2024-01-30'
      },
      {
        id: 'ORD-2024-004',
        date: '2024-01-10',
        status: 'cancelled',
        total: 159.99,
        items: [
          {
            id: 5,
            name: 'Wireless Charging Pad',
            image: '/api/placeholder/80/80',
            price: 159.99,
            quantity: 1,
            color: 'White'
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        cancellationReason: 'Customer requested cancellation'
      }
    ];
    setOrders(mockOrders);
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
            <p className="text-lg font-semibold" style={{color: 'oklch(0.3 0.1 70)'}}>
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Order Items */}
        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{backgroundColor: 'oklch(0.98 0.05 70)'}}>
              <img 
                src={item.image} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h4 className="font-medium" style={{color: 'oklch(0.3 0.1 70)'}}>
                  {item.name}
                </h4>
                <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                  Color: {item.color} • Qty: {item.quantity}
                </p>
                <p className="text-sm font-medium" style={{color: 'oklch(0.4 0.1 70)'}}>
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

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

  return (
    <div className="min-h-screen" style={{backgroundColor: 'oklch(0.95 0.1 70)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
            My Orders
          </h1>
          <p className="text-lg" style={{color: 'oklch(0.5 0.05 70)'}}>
            Track and manage your order history
          </p>
        </div>

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
