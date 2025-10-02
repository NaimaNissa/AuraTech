import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc
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
    const q = query(ordersRef, where('Email', '==', email), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log(`📦 Found ${snapshot.size} orders for ${email}`);
    
    const orders = [];
    snapshot.forEach((doc) => {
      const orderData = { id: doc.id, ...doc.data() };
      console.log('📄 Order data:', orderData);
      orders.push(orderData);
    });
    
    console.log('✅ Returning orders:', orders);
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
