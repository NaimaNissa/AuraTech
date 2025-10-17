import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrdersByEmail } from '../lib/orderService';
import { getProductById, getAllProducts } from '../lib/productService';
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
        console.log('❌ No current user email found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Loading orders for user:', currentUser.email);
        console.log('🔍 Current user object:', currentUser);
        
        const userOrders = await getOrdersByEmail(currentUser.email);
        console.log('📦 Raw orders from Firebase:', userOrders);
        console.log('📦 Number of orders found:', userOrders.length);
        console.log('📦 User email being searched:', currentUser.email);
        
        // Log each order's email to verify filtering
        userOrders.forEach((order, index) => {
          console.log(`📦 Order ${index + 1} email:`, order.Email, 'matches user:', order.Email === currentUser.email);
        });
        
        // Transform Firebase orders to match UI format
        const transformedOrders = userOrders.map(order => {
          console.log('🔄 Transforming order:', order);
          console.log('🔄 Order ProductImage field:', order.ProductImage);
          console.log('🔄 Order productImg field:', order.productImg);
          console.log('🔄 Order image field:', order.image);
          
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
              image: order.productImg || order.ProductImage || order.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
              price: parseFloat(order.Price || 0),
              quantity: parseInt(order.Quantity || 1),
              color: order.ProductColor || order.Color || 'Default'
            }],
            productColor: order.ProductColor || order.Color || 'Default', // Add product color to order level
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
        
        // Sort orders by date (latest first)
        const sortedOrders = transformedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
        console.log('✅ Orders loaded and sorted:', sortedOrders.length);
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

  // Test function to check products
  const testProducts = async () => {
    try {
      console.log('🧪 Testing products fetch...');
      const products = await getAllProducts();
      console.log('🧪 Products fetched:', products.length);
      console.log('🧪 First few products:', products.slice(0, 3).map(p => ({ name: p.name, image: p.image })));
    } catch (error) {
      console.error('🧪 Error fetching products:', error);
    }
  };

  // Function to get the correct product image by searching products collection
  const getProductImage = async (order) => {
    console.log('🖼️ Getting product image for order:', order.id);
    console.log('🖼️ Order data:', {
      productImg: order.productImg,
      ProductImage: order.ProductImage,
      image: order.image,
      productname: order.productname,
      productColor: order.productColor
    });

    // First try to get image from order data
    if (order.productImg && order.productImg !== '' && order.productImg !== 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop') {
      console.log('✅ Using productImg from order:', order.productImg);
      return order.productImg;
    }
    if (order.ProductImage && order.ProductImage !== '' && order.ProductImage !== 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop') {
      console.log('✅ Using ProductImage from order:', order.ProductImage);
      return order.ProductImage;
    }
    if (order.image && order.image !== '' && order.image !== 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop') {
      console.log('✅ Using image from order:', order.image);
      return order.image;
    }

    // If no valid image in order, search products collection by name
    try {
      console.log('🔍 No valid image in order, searching products collection...');
      console.log('🔍 Product name:', order.productname);
      
      // Get all products and search by name
      const allProducts = await getAllProducts();
      console.log('📦 Total products in database:', allProducts.length);
      
      // Find product by name (exact match or contains)
      const matchingProduct = allProducts.find(product => {
        const orderName = order.productname?.toLowerCase() || '';
        const productName = product.name?.toLowerCase() || '';
        
        // Try exact match first
        if (orderName === productName) {
          console.log('✅ Exact name match found:', product.name);
          return true;
        }
        
        // Try partial match (order name contains product name or vice versa)
        if (orderName.includes(productName) || productName.includes(orderName)) {
          console.log('✅ Partial name match found:', product.name);
          return true;
        }
        
        return false;
      });
      
      if (matchingProduct && matchingProduct.image) {
        console.log('✅ Found matching product:', matchingProduct.name);
        console.log('✅ Product image:', matchingProduct.image);
        return matchingProduct.image;
      }
      
      console.log('❌ No matching product found for:', order.productname);
      
    } catch (error) {
      console.log('❌ Could not search products collection:', error);
    }

    // Fallback to generic image
    console.log('⚠️ Using fallback image for order:', order.id);
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
  };

  // Handle view details
  const handleViewDetails = (order) => {
    console.log('📋 Viewing details for order:', order.id);
    
    // Create a detailed order view modal or navigate to details page
    const orderDetails = {
      orderId: order.id,
      date: order.date,
      status: order.status,
      items: order.items,
      total: order.total,
      shippingCost: order.shippingCost,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery
    };
    
    // For now, show an alert with order details
    // In a real app, this would open a modal or navigate to a details page
    alert(`Order Details:\n\nOrder ID: ${order.id}\nDate: ${new Date(order.date).toLocaleDateString()}\nStatus: ${order.status}\nTotal: $${order.total.toFixed(2)}\n\nItems:\n${order.items.map(item => `• ${item.name} (${item.quantity}x) - $${item.price.toFixed(2)} each`).join('\n')}\n\nShipping Address:\n${order.shippingAddress.name}\n${order.shippingAddress.street}\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}\n${order.shippingAddress.country}`);
  };

  // Handle download invoice
  const handleDownloadInvoice = (order) => {
    console.log('📄 Downloading invoice for order:', order.id);
    
    // Create invoice content
    const invoiceContent = `
AuraTech Invoice
================

Order ID: ${order.id}
Date: ${new Date(order.date).toLocaleDateString()}
Status: ${order.status.toUpperCase()}

BILLING INFORMATION:
${order.shippingAddress.name}
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}

ORDER ITEMS:
${order.items.map(item => `
• ${item.name}
  Color: ${item.color}
  Quantity: ${item.quantity}
  Price: $${item.price.toFixed(2)} each
  Subtotal: $${(item.price * item.quantity).toFixed(2)}
`).join('')}

ORDER SUMMARY:
Subtotal: $${(order.total - (order.shippingCost || 0)).toFixed(2)}
Shipping: $${(order.shippingCost || 0).toFixed(2)}
TOTAL: $${order.total.toFixed(2)}

Thank you for choosing AuraTech!
    `.trim();
    
    // Create and download the invoice file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraTech-Invoice-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Invoice downloaded successfully');
  };

  // Product Image Component
  const ProductImage = ({ order }) => {
    const [imageSrc, setImageSrc] = useState('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      const loadImage = async () => {
        setLoading(true);
        setError(false);
        try {
          console.log('🖼️ Loading image for order:', order.id);
          console.log('🖼️ Order product name:', order.productname);
          const image = await getProductImage(order);
          console.log('🖼️ Got image from getProductImage:', image);
          console.log('🖼️ Setting image source to:', image);
          setImageSrc(image);
          console.log('🖼️ Image source set successfully');
        } catch (error) {
          console.error('❌ Error loading product image:', error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      loadImage();
    }, [order.id, order.productname]); // Add dependencies to trigger re-render

    console.log('🖼️ ProductImage component render - imageSrc:', imageSrc, 'loading:', loading);

    if (loading) {
      return (
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <img 
        src={imageSrc} 
        alt={order.items[0]?.name || 'Product'}
        className="w-16 h-16 object-cover rounded-md"
        onError={(e) => {
          console.log('❌ Image failed to load:', imageSrc);
          setError(true);
          e.target.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop';
        }}
        onLoad={() => {
          console.log('✅ Image loaded successfully:', imageSrc);
        }}
      />
    );
  };

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
              <ProductImage order={order} />
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
            onClick={() => handleViewDetails(order)}
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
            onClick={() => handleDownloadInvoice(order)}
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
            <div className="flex gap-2">
              <Button
                onClick={testProducts}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                Test Products
              </Button>
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
                          image: order.productImg || order.ProductImage || order.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
                          price: parseFloat(order.Price || 0),
                          quantity: parseInt(order.Quantity || 1),
                          color: order.ProductColor || order.Color || 'Default'
                        }],
                        productColor: order.ProductColor || order.Color || 'Default', // Add product color to order level
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
                    
                    // Sort orders by date (latest first)
                    const sortedOrders = transformedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setOrders(sortedOrders);
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
