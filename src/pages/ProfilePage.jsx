import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, defaultUserProfile } from '../lib/userService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Shield,
  CreditCard,
  Bell,
  Globe
} from 'lucide-react';
import DeleteAllReviews from '../components/DeleteAllReviews';

export default function ProfilePage({ onNavigate }) {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(defaultUserProfile);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to basic user info
          setUserProfile(prev => ({
            ...prev,
            displayName: currentUser.displayName || '',
            email: currentUser.email || ''
          }));
        }
      }
    };

    loadUserProfile();
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserProfile(currentUser.uid, userProfile);
      console.log('Profile updated:', userProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (currentUser) {
      setUserProfile(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'oklch(0.95 0.1 70)'}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
            My Profile
          </h1>
          <p className="text-lg" style={{color: 'oklch(0.5 0.05 70)'}}>
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl font-bold text-white" 
                       style={{backgroundColor: 'oklch(0.7 0.15 70)'}}>
                    {userProfile.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                    {userProfile.displayName || 'User'}
                  </h3>
                  <Badge className="mb-4" style={{backgroundColor: 'oklch(0.8 0.12 70)', color: 'oklch(0.3 0.1 70)'}}>
                    {userProfile.membership.type} Member
                  </Badge>
                  <div className="space-y-2 text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                    <p>Member since {new Date(userProfile.membership.joinDate).toLocaleDateString()}</p>
                    <p>{userProfile.membership.points} loyalty points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                  <Shield className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('orders')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate('cart')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Shopping Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                    style={{backgroundColor: 'oklch(0.7 0.15 70)', color: 'white'}}
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                      style={{backgroundColor: 'oklch(0.6 0.2 70)', color: 'white'}}
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="displayName"
                      value={userProfile.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={userProfile.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{color: 'oklch(0.3 0.1 70)'}}>
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={userProfile.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={userProfile.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={userProfile.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={userProfile.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={userProfile.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preferences */}
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{color: 'oklch(0.3 0.1 70)'}}>
                    Communication Preferences
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Newsletter</Label>
                        <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                          Receive updates about new products and offers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.newsletter}
                        onChange={(e) => handleInputChange('preferences.newsletter', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                          Receive order updates via text message
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.smsNotifications}
                        onChange={(e) => handleInputChange('preferences.smsNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm" style={{color: 'oklch(0.5 0.05 70)'}}>
                          Receive order confirmations and shipping updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userProfile.preferences.emailNotifications}
                        onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Admin Section - Delete All Reviews */}
        <div className="mt-8">
          <DeleteAllReviews />
        </div>
      </div>
    </div>
  );
}
