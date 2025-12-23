import { useState } from 'react';
import { deleteAllReviews } from '../lib/reviewService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function DeleteAllReviews() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDeleteAll = async () => {
    // Double confirmation
    const confirmed = window.confirm(
      '⚠️ WARNING: This will delete ALL reviews from the database. This action cannot be undone.\n\nAre you sure you want to continue?'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      '⚠️ FINAL CONFIRMATION: You are about to permanently delete all reviews. Click OK to proceed.'
    );
    
    if (!doubleConfirmed) return;

    try {
      setIsDeleting(true);
      setError(null);
      setResult(null);

      const response = await deleteAllReviews();
      setResult(response);
      console.log('✅ All reviews deleted successfully:', response);
    } catch (err) {
      console.error('❌ Error deleting reviews:', err);
      setError(err.message || 'Failed to delete reviews');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Delete All Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This will permanently delete all reviews from the Feedback collection. 
          Only new reviews submitted by users will appear after this action.
        </p>

        {result && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully deleted {result.deletedCount} review(s).
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleDeleteAll}
          disabled={isDeleting}
          variant="destructive"
          className="w-full"
        >
          {isDeleting ? 'Deleting...' : 'Delete All Reviews'}
        </Button>
      </CardContent>
    </Card>
  );
}




