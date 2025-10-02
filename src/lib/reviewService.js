// Customer review service
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Create a new review
export const createReview = async (reviewData) => {
  try {
    console.log('📝 Creating review:', reviewData);
    
    const reviewsRef = collection(db, 'Feedback');
    
    const review = {
      productId: reviewData.productId,
      productName: reviewData.productName,
      customerName: reviewData.customerName,
      customerEmail: reviewData.customerEmail,
      Stars: reviewData.rating.toString(), // Store as string to match dashboard structure
      Feedback: reviewData.comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verified: false, // Can be updated by admin
      helpful: 0 // Number of helpful votes
    };
    
    const docRef = await addDoc(reviewsRef, review);
    console.log('✅ Review created successfully:', docRef.id);
    
    return { id: docRef.id, ...review };
  } catch (error) {
    console.error('❌ Error creating review:', error);
    throw error;
  }
};

// Get reviews for a specific product
export const getProductReviews = async (productId) => {
  try {
    console.log('🔍 Fetching reviews for product:', productId);
    
    const reviewsRef = collection(db, 'Feedback');
    const q = query(
      reviewsRef, 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const reviews = [];
    snapshot.forEach((doc) => {
      const reviewData = { id: doc.id, ...doc.data() };
      reviews.push(transformReview(reviewData));
    });
    
    console.log(`✅ Found ${reviews.length} reviews for product ${productId}`);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    // Return empty array instead of throwing to not break the UI
    return [];
  }
};

// Get all reviews (for admin dashboard)
export const getAllReviews = async () => {
  try {
    console.log('🔍 Fetching all reviews...');
    
    const reviewsRef = collection(db, 'Feedback');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    
    const reviews = [];
    snapshot.forEach((doc) => {
      const reviewData = { id: doc.id, ...doc.data() };
      reviews.push(transformReview(reviewData));
    });
    
    console.log(`✅ Found ${reviews.length} total reviews`);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching all reviews:', error);
    return [];
  }
};

// Get reviews by customer email
export const getCustomerReviews = async (customerEmail) => {
  try {
    console.log('🔍 Fetching reviews for customer:', customerEmail);
    
    const reviewsRef = collection(db, 'Feedback');
    const q = query(
      reviewsRef, 
      where('customerEmail', '==', customerEmail),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const reviews = [];
    snapshot.forEach((doc) => {
      const reviewData = { id: doc.id, ...doc.data() };
      reviews.push(transformReview(reviewData));
    });
    
    console.log(`✅ Found ${reviews.length} reviews by customer ${customerEmail}`);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching customer reviews:', error);
    return [];
  }
};

// Transform Firebase review data to UI format
const transformReview = (firebaseReview) => {
  return {
    id: firebaseReview.id,
    productId: firebaseReview.productId,
    productName: firebaseReview.productName || 'Unknown Product',
    customerName: firebaseReview.customerName || 'Anonymous',
    customerEmail: firebaseReview.customerEmail,
    rating: parseInt(firebaseReview.Stars) || 5,
    comment: firebaseReview.Feedback || '',
    date: firebaseReview.createdAt || new Date().toISOString(),
    verified: firebaseReview.verified || false,
    helpful: firebaseReview.helpful || 0,
    createdAt: firebaseReview.createdAt,
    updatedAt: firebaseReview.updatedAt
  };
};

// Update review
export const updateReview = async (reviewId, updateData) => {
  try {
    console.log('📝 Updating review:', reviewId, updateData);
    
    const reviewRef = doc(db, 'Feedback', reviewId);
    
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Convert rating to string if provided
    if (updateData.rating !== undefined) {
      updatePayload.Stars = updateData.rating.toString();
      delete updatePayload.rating;
    }
    
    // Convert comment to Feedback if provided
    if (updateData.comment !== undefined) {
      updatePayload.Feedback = updateData.comment;
      delete updatePayload.comment;
    }
    
    await updateDoc(reviewRef, updatePayload);
    console.log('✅ Review updated successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error updating review:', error);
    throw error;
  }
};

// Delete review
export const deleteReview = async (reviewId) => {
  try {
    console.log('🗑️ Deleting review:', reviewId);
    
    const reviewRef = doc(db, 'Feedback', reviewId);
    await deleteDoc(reviewRef);
    
    console.log('✅ Review deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    throw error;
  }
};

// Calculate average rating for a product
export const calculateProductRating = async (productId) => {
  try {
    const reviews = await getProductReviews(productId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
      ratingDistribution
    };
  } catch (error) {
    console.error('❌ Error calculating product rating:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

// Check if customer can review product (has purchased it)
export const canCustomerReviewProduct = async (customerEmail, productId) => {
  try {
    // Check if customer has ordered this product
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('Email', '==', customerEmail)
    );
    
    const snapshot = await getDocs(q);
    
    let hasPurchased = false;
    snapshot.forEach((doc) => {
      const orderData = doc.data();
      // This is a simplified check - in a real system you'd need to match product IDs
      if (orderData.productname) {
        hasPurchased = true;
      }
    });
    
    // Check if customer has already reviewed this product
    const existingReviews = await getProductReviews(productId);
    const hasReviewed = existingReviews.some(review => review.customerEmail === customerEmail);
    
    return {
      canReview: hasPurchased && !hasReviewed,
      hasPurchased,
      hasReviewed,
      reason: !hasPurchased ? 'Must purchase product to review' : 
              hasReviewed ? 'Already reviewed this product' : 
              'Can review'
    };
  } catch (error) {
    console.error('❌ Error checking review eligibility:', error);
    return {
      canReview: false,
      hasPurchased: false,
      hasReviewed: false,
      reason: 'Error checking eligibility'
    };
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'Feedback', reviewId);
    
    // Get current helpful count and increment
    const reviewDoc = await getDoc(reviewRef);
    const currentHelpful = reviewDoc.data()?.helpful || 0;
    
    await updateDoc(reviewRef, {
      helpful: currentHelpful + 1,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Review marked as helpful');
    return true;
  } catch (error) {
    console.error('❌ Error marking review as helpful:', error);
    throw error;
  }
};

