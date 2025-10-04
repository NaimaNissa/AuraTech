import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { sendOrderConfirmationEmailSimple } from './emailService';

// Generate a unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    console.log('🔄 Creating order with data:', orderData);
    
    // Validate required fields
    if (!orderData.fullName || !orderData.email || !orderData.address || !orderData.productName) {
      throw new Error('Missing required order data fields');
    }
    
    const orderId = generateOrderId();
    console.log('📝 Generated order ID:', orderId);
    const orderRef = collection(db, 'orders');
    
    const order = {
      OrderID: orderId,
      FullName: orderData.fullName,
      Email: orderData.email,
      Address: orderData.address,
      productname: orderData.productName,
      Quantity: orderData.quantity.toString(),
      Price: orderData.price.toString(),
      ShippingCost: orderData.shippingCost?.toString() || '0',
      TotalPrice: orderData.totalPrice.toString(),
      Status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Adding order to Firebase:', order);
    const docRef = await addDoc(orderRef, order);
    console.log('✅ Order added to Firebase with ID:', docRef.id);
    
    // Also create customer record (non-blocking)
    try {
      console.log('👤 Creating customer record...');
      await createCustomer({
        FullName: orderData.fullName,
        Email: orderData.email,
        Contact: orderData.contact || '',
        Address: orderData.address,
        OrderID: orderId
      });
      console.log('✅ Customer record created');
    } catch (customerError) {
      console.error('⚠️ Failed to create customer record:', customerError);
      // Don't fail the order creation if customer record fails
    }
    
    // Create invoice record (non-blocking)
    try {
      console.log('🧾 Creating invoice record...');
      await createInvoice({
        CustomerName: orderData.fullName,
        Email: orderData.email,
        Address: orderData.address,
        Product: orderData.productName,
        Quantity: orderData.quantity.toString(),
        Price: orderData.price.toString(),
        ShippingCost: orderData.shippingCost?.toString() || '0',
        TotalPrice: orderData.totalPrice.toString(),
        OrderDate: new Date().toISOString(),
        Description: orderData.description || '',
        Note: orderData.note || ''
      });
      console.log('✅ Invoice record created');
    } catch (invoiceError) {
      console.error('⚠️ Failed to create invoice record:', invoiceError);
      // Don't fail the order creation if invoice fails
    }
    
    // Create shipment record (non-blocking)
    try {
      console.log('🚚 Creating shipment record...');
      await createShipment({
        Address: orderData.address,
        ShipmentID: `SHIP-${orderId}`,
        ShippingCost: orderData.shippingCost?.toString() || '0'
      });
      console.log('✅ Shipment record created');
    } catch (shipmentError) {
      console.error('⚠️ Failed to create shipment record:', shipmentError);
      // Don't fail the order creation if shipment fails
    }
    
    // Send order confirmation email (non-blocking)
    try {
      console.log('📧 Sending order confirmation email...');
      const emailData = {
        ...order,
        customerEmail: orderData.email,
        fullName: orderData.fullName,
        shippingCost: orderData.shippingCost || 0
      };
      await sendOrderConfirmationEmailSimple(emailData);
      console.log('✅ Order confirmation email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }
    
    console.log('✅ Order created successfully:', orderId);
    return { ...order, orderId, docId: docRef.id };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Create customer record
export const createCustomer = async (customerData) => {
  try {
    const customerRef = collection(db, 'customers');
    
    const customer = {
      FullName: customerData.FullName,
      Email: customerData.Email,
      Contact: customerData.Contact,
      Address: customerData.Address,
      OrderID: customerData.OrderID
    };
    
    await addDoc(customerRef, customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Create invoice record
export const createInvoice = async (invoiceData) => {
  try {
    const invoiceRef = collection(db, 'invoices');
    
    const invoice = {
      CustomerName: invoiceData.CustomerName,
      Email: invoiceData.Email,
      Address: invoiceData.Address,
      Product: invoiceData.Product,
      Quantity: invoiceData.Quantity,
      Price: invoiceData.Price,
      ShippingCost: invoiceData.ShippingCost,
      TotalPrice: invoiceData.TotalPrice,
      OrderDate: invoiceData.OrderDate,
      Description: invoiceData.Description,
      Note: invoiceData.Note
    };
    
    await addDoc(invoiceRef, invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

// Get orders by user email
export const getOrdersByEmail = async (email) => {
  try {
    console.log('🔍 Fetching orders for email:', email);
    const ordersRef = collection(db, 'orders');
    // Remove orderBy from query to avoid index requirement, we'll sort in JavaScript
    const q = query(ordersRef, where('Email', '==', email));
    const snapshot = await getDocs(q);
    
    console.log(`📦 Found ${snapshot.size} orders for ${email}`);
    
    const orders = [];
    snapshot.forEach((doc) => {
      const orderData = { id: doc.id, ...doc.data() };
      console.log('📄 Order data:', orderData);
      orders.push(orderData);
    });
    
    // Sort orders by creation date (newest first) since we can't use orderBy in the query
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('✅ Orders fetched and sorted successfully');
    return orders;
  } catch (error) {
    console.error('❌ Error fetching orders by email:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('OrderID', '==', orderId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Create shipment record
export const createShipment = async (shipmentData) => {
  try {
    const shipmentRef = collection(db, 'shipments');
    
    const shipment = {
      ShipmentID: shipmentData.shipmentId,
      Address: shipmentData.address,
      ShippingCost: shipmentData.shippingCost.toString()
    };
    
    await addDoc(shipmentRef, shipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
};

// Get order statistics for a user
export const getOrderStatistics = async (email) => {
  try {
    console.log('📊 Fetching order statistics for:', email);
    const orders = await getOrdersByEmail(email);
    
    const stats = {
      totalOrders: orders.length,
      totalSpent: 0,
      averageOrderValue: 0,
      statusCounts: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      },
      recentOrders: [],
      monthlySpending: {}
    };
    
    if (orders.length > 0) {
      // Calculate totals
      stats.totalSpent = orders.reduce((sum, order) => {
        return sum + parseFloat(order.TotalPrice || 0);
      }, 0);
      
      stats.averageOrderValue = stats.totalSpent / stats.totalOrders;
      
      // Count by status
      orders.forEach(order => {
        const status = (order.Status || 'pending').toLowerCase();
        if (stats.statusCounts.hasOwnProperty(status)) {
          stats.statusCounts[status]++;
        }
      });
      
      // Get recent orders (last 5)
      stats.recentOrders = orders.slice(0, 5).map(order => ({
        id: order.OrderID || order.id,
        date: order.createdAt,
        total: parseFloat(order.TotalPrice || 0),
        status: order.Status || 'pending',
        productName: order.productname || 'Unknown Product'
      }));
      
      // Calculate monthly spending
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!stats.monthlySpending[monthKey]) {
          stats.monthlySpending[monthKey] = 0;
        }
        stats.monthlySpending[monthKey] += parseFloat(order.TotalPrice || 0);
      });
    }
    
    console.log('✅ Order statistics calculated:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error calculating order statistics:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
  try {
    console.log('🔄 Updating order status:', orderId, 'to', newStatus);
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('OrderID', '==', orderId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Order not found');
    }
    
    const docRef = doc(db, 'orders', snapshot.docs[0].id);
    const updateData = {
      Status: newStatus,
      updatedAt: new Date().toISOString(),
      ...additionalData
    };
    
    await updateDoc(docRef, updateData);
    console.log('✅ Order status updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};
