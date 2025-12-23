// Customer review service
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
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
      product: reviewData.productId, // Store product ID as string to match your structure
      Stars: reviewData.rating.toString(), // Store as string to match dashboard structure
      Feedback: reviewData.comment || '', // Store as string to match dashboard structure
      customerName: reviewData.customerName,
      customerEmail: reviewData.customerEmail,
      productName: reviewData.productName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verified: false, // Can be updated by admin
      helpful: 0 // Number of helpful votes
    };
    
    const docRef = await addDoc(reviewsRef, review);
    console.log('✅ Review created successfully:', docRef.id);
    console.log('📝 Review data saved:', review);
    
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
    console.log('🔍 Product ID type:', typeof productId);
    console.log('🔍 Product ID value:', productId);
    
    if (!productId) {
      console.warn('⚠️ No product ID provided for review fetch');
      return [];
    }
    
    const reviewsRef = collection(db, 'Feedback');
    console.log('🔍 Querying Feedback collection...');
    
    // Try multiple query approaches to handle different product ID formats
    let snapshot;
    let reviews = [];
    
    // First try: Query by 'product' field
    try {
      console.log('🔍 Trying query by product field...');
      const q1 = query(reviewsRef, where('product', '==', productId));
      snapshot = await getDocs(q1);
      console.log('🔍 Query by product field executed, snapshot size:', snapshot.size);
      
      if (snapshot.size > 0) {
        snapshot.forEach((doc) => {
          const reviewData = { id: doc.id, ...doc.data() };
          console.log('📄 Raw review data (product field):', reviewData);
          const transformedReview = transformReview(reviewData);
          reviews.push(transformedReview);
        });
      }
    } catch (error) {
      console.log('⚠️ Query by product field failed:', error.message);
    }
    
    // Second try: Query by 'productId' field (fallback)
    if (reviews.length === 0) {
      try {
        console.log('🔍 Trying query by productId field...');
        const q2 = query(reviewsRef, where('productId', '==', productId));
        snapshot = await getDocs(q2);
        console.log('🔍 Query by productId field executed, snapshot size:', snapshot.size);
        
        if (snapshot.size > 0) {
          snapshot.forEach((doc) => {
            const reviewData = { id: doc.id, ...doc.data() };
            console.log('📄 Raw review data (productId field):', reviewData);
            const transformedReview = transformReview(reviewData);
            reviews.push(transformedReview);
          });
        }
      } catch (error) {
        console.log('⚠️ Query by productId field failed:', error.message);
      }
    }
    
    // Third try: Query by 'productName' field (fallback)
    if (reviews.length === 0) {
      try {
        console.log('🔍 Trying query by productName field...');
        const q3 = query(reviewsRef, where('productName', '==', productId));
        snapshot = await getDocs(q3);
        console.log('🔍 Query by productName field executed, snapshot size:', snapshot.size);
        
        if (snapshot.size > 0) {
          snapshot.forEach((doc) => {
            const reviewData = { id: doc.id, ...doc.data() };
            console.log('📄 Raw review data (productName field):', reviewData);
            const transformedReview = transformReview(reviewData);
            reviews.push(transformedReview);
          });
        }
      } catch (error) {
        console.log('⚠️ Query by productName field failed:', error.message);
      }
    }
    
    // Sort reviews by creation date (newest first) in JavaScript
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`✅ Found ${reviews.length} reviews for product ${productId}`);
    console.log('📋 All transformed reviews:', reviews);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
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
    productId: firebaseReview.product || firebaseReview.productId, // Handle both field names
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

// Get latest reviews for homepage (max 5)
export const getLatestReviews = async (limit = 5) => {
  try {
    console.log('🔍 Fetching latest reviews for homepage...');
    
    const reviewsRef = collection(db, 'Feedback');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    
    const reviews = [];
    snapshot.forEach((doc) => {
      const reviewData = { id: doc.id, ...doc.data() };
      reviews.push(transformReview(reviewData));
    });
    
    // Limit to specified number and filter out reviews without proper data
    const latestReviews = reviews
      .filter(review => review.customerName && review.comment && review.rating > 0)
      .slice(0, limit);
    
    console.log(`✅ Found ${latestReviews.length} latest reviews for homepage`);
    return latestReviews;
  } catch (error) {
    console.error('❌ Error fetching latest reviews:', error);
    return [];
  }
};

// Debug function to create a test review for a specific product
export const createTestReview = async (productId, productName) => {
  try {
    console.log('🧪 Creating test review for product:', productId);
    
    const reviewsRef = collection(db, 'Feedback');
    const testReview = {
      product: productId, // Store product ID as string
      Stars: '5', // Store as string to match dashboard structure
      Feedback: 'This is a test review to verify the review system is working correctly. Great product!', // Store as string
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      productName: productName || 'Test Product',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verified: false,
      helpful: 0
    };
    
    const docRef = await addDoc(reviewsRef, testReview);
    console.log('✅ Test review created successfully:', docRef.id);
    console.log('🧪 Test review data:', testReview);
    return { id: docRef.id, ...testReview };
  } catch (error) {
    console.error('❌ Error creating test review:', error);
    throw error;
  }
};

// Delete all reviews from the Feedback collection
export const deleteAllReviews = async () => {
  try {
    console.log('🗑️ Deleting all reviews...');
    
    const reviewsRef = collection(db, 'Feedback');
    const snapshot = await getDocs(reviewsRef);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${snapshot.size} reviews`);
    return { success: true, deletedCount: snapshot.size };
  } catch (error) {
    console.error('❌ Error deleting all reviews:', error);
    throw error;
  }
};

