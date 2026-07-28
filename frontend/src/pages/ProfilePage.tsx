import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Heart,
  Camera,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Address, Order, AddressLabel } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordSchema = z.infer<typeof passwordSchema>;

const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().default('Nepal'),
  isDefault: z.boolean().default(false),
});

type AddressSchema = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  usePageTitle();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, updateProfile, uploadAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
  });

  const addressForm = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'home',
      country: 'Nepal',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
      setAddresses(user.addresses || []);
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const { data } = await api.get('/orders/my-orders', { params: { limit: 5 } });
        setOrders(data.data || []);
      } catch {
        // handled silently
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, navigate]);

  const onProfileSubmit = async (data: ProfileSchema) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  const onPasswordSubmit = async (data: PasswordSchema) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to change password';
      toast.error(message);
    }
  };

  const onAddressSubmit = async (data: AddressSchema) => {
    try {
      if (isEditingAddress !== null) {
        const { data: res } = await api.put(
          `/addresses/${isEditingAddress}`,
          data,
        );
        setAddresses(res.data.addresses);
        toast.success('Address updated');
      } else {
        const { data: res } = await api.post('/addresses', data);
        setAddresses(res.data.addresses);
        toast.success('Address added');
      }
      setIsEditingAddress(null);
      setIsAddingAddress(false);
      addressForm.reset({ label: 'home', country: 'Nepal', isDefault: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save address';
      toast.error(message);
    }
  };

  const deleteAddress = async (index: number) => {
    try {
      const { data: res } = await api.delete(`/addresses/${index}`);
      setAddresses(res.data.addresses);
      toast.success('Address deleted');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete address';
      toast.error(message);
    }
  };

  const setDefaultAddress = async (index: number) => {
    try {
      const { data: res } = await api.put(`/addresses/${index}/default`);
      setAddresses(res.data.addresses);
      toast.success('Default address updated');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to set default address';
      toast.error(message);
    }
  };

  const startEditAddress = (index: number) => {
    const addr = addresses[index];
    addressForm.reset({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setIsEditingAddress(index);
    setIsAddingAddress(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success('Avatar updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar';
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const labelIcons: Record<AddressLabel, typeof MapPin> = {
    home: MapPin,
    work: MapPin,
    other: MapPin,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-heading text-foreground mb-6">My Profile</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative mx-auto mb-3 group"
                    disabled={isUploadingAvatar}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </button>
                  <p className="text-xs text-muted-foreground">Click to change photo</p>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user.role}
                  </Badge>
                </div>

                <nav className="space-y-1">
                  {(
                    [
                      { key: 'profile' as const, label: 'Profile', icon: User },
                      { key: 'password' as const, label: 'Password', icon: Lock },
                      ...(user.role !== 'admin' ? [{ key: 'addresses' as const, label: 'Addresses', icon: MapPin }] : []),
                    ]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {user.role !== 'admin' && (
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      Order History
                    </Link>
                    {user.role === 'customer' && (
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-4 max-w-lg"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          leftIcon={<User className="h-4 w-4" />}
                          error={profileForm.formState.errors.firstName?.message}
                          {...profileForm.register('firstName')}
                        />
                        <Input
                          label="Last Name"
                          error={profileForm.formState.errors.lastName?.message}
                          {...profileForm.register('lastName')}
                        />
                      </div>
                      <Input
                        label="Email"
                        value={user.email}
                        disabled
                        leftIcon={<Mail className="h-4 w-4" />}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        placeholder="+977 98XXXXXXXX"
                        leftIcon={<Phone className="h-4 w-4" />}
                        error={profileForm.formState.errors.phone?.message}
                        {...profileForm.register('phone')}
                      />
                      <p className="text-xs text-muted-foreground">
                        Member since {formatDate(user.createdAt)}
                      </p>
                      <Button
                        type="submit"
                        isLoading={profileForm.formState.isSubmitting}
                      >
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4 max-w-lg"
                    >
                      <Input
                        label="Current Password"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                        error={
                          passwordForm.formState.errors.currentPassword?.message
                        }
                        {...passwordForm.register('currentPassword')}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                        error={
                          passwordForm.formState.errors.newPassword?.message
                        }
                        {...passwordForm.register('newPassword')}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        leftIcon={<Lock className="h-4 w-4" />}
                        error={
                          passwordForm.formState.errors.confirmPassword?.message
                        }
                        {...passwordForm.register('confirmPassword')}
                      />
                      <Button
                        type="submit"
                        isLoading={passwordForm.formState.isSubmitting}
                      >
                        Change Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Addresses</CardTitle>
                      <CardDescription>
                        Manage your shipping addresses
                      </CardDescription>
                    </div>
                    {!isAddingAddress && (
                      <Button
                        size="sm"
                        onClick={() => {
                          addressForm.reset({
                            label: 'home',
                            country: 'Nepal',
                            isDefault: false,
                          });
                          setIsEditingAddress(null);
                          setIsAddingAddress(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isAddingAddress && (
                      <form
                        onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                        className="mb-6 p-4 rounded-lg border border-border space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                              Label
                            </label>
                            <div className="flex gap-2">
                              {(['home', 'work', 'other'] as AddressLabel[]).map(
                                (label) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() =>
                                      addressForm.setValue('label', label)
                                    }
                                    className={`flex-1 rounded-lg border-2 p-2 text-sm capitalize transition-colors ${
                                      addressForm.watch('label') === label
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-muted-foreground/30'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                          <Input
                            label="ZIP Code"
                            placeholder="44600"
                            error={addressForm.formState.errors.zipCode?.message}
                            {...addressForm.register('zipCode')}
                          />
                        </div>
                        <Input
                          label="Street Address"
                          placeholder="Street address"
                          error={addressForm.formState.errors.street?.message}
                          {...addressForm.register('street')}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="City"
                            placeholder="City"
                            error={addressForm.formState.errors.city?.message}
                            {...addressForm.register('city')}
                          />
                          <Input
                            label="State/Province"
                            placeholder="State"
                            error={addressForm.formState.errors.state?.message}
                            {...addressForm.register('state')}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                            {...addressForm.register('isDefault')}
                          />
                          <span className="text-muted-foreground">
                            Set as default address
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            {isEditingAddress !== null ? 'Update' : 'Add'} Address
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingAddress(false);
                              setIsEditingAddress(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {addresses.length === 0 && !isAddingAddress ? (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No addresses saved yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr, index) => {
                          const LabelIcon = labelIcons[addr.label];
                          return (
                            <div
                              key={index}
                              className={`relative rounded-lg border p-4 ${
                                addr.isDefault
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <LabelIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground capitalize">
                                        {addr.label}
                                      </span>
                                      {addr.isDefault && (
                                        <Badge variant="primary" className="text-xs">
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {addr.street}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {addr.city}, {addr.state} {addr.zipCode}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {addr.country}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!addr.isDefault && (
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setDefaultAddress(index)}
                                      title="Set as default"
                                    >
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => startEditAddress(index)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => deleteAddress(index)}
                                    title="Delete"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Orders Summary */}
                <Card variant="elevated" className="mt-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>
                        Your latest order activity
                      </CardDescription>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/orders">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No orders yet</p>
                        <Button asChild variant="link" className="mt-2">
                          <Link to="/shop">Start Shopping</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                #{order.orderNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(order.createdAt)} &middot;{' '}
                                {order.items.length} item(s)
                              </p>
                            </div>
                            <Badge
                              variant={
                                order.status === 'delivered'
                                  ? 'success'
                                  : order.status === 'cancelled'
                                    ? 'destructive'
                                    : 'default'
                              }
                            >
                              {order.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
