import { useState, useMemo } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Store, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

const sellerRegisterSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^(\+977|0)?[1-9]\d{9}$/, 'Please enter a valid Nepali phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SellerRegisterSchema = z.infer<typeof sellerRegisterSchema>;

export default function SellerRegister() {
  usePageTitle();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellerRegisterSchema>({
    resolver: zodResolver(sellerRegisterSchema),
  });

  const password = watch('password', '');
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
  }, [password]);

  const onSubmit = async (data: SellerRegisterSchema) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const accessToken = res.data?.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        toast.success(res.data?.message || 'Account created! Now let\'s set up your shop.');
        window.location.href = '/seller/apply';
      } else {
        toast.success('Account created! Check your email to verify your account.');
        navigate('/verify-email', { replace: true });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } };
      const validationErrors = axiosErr.response?.data?.errors;
      if (validationErrors?.length) {
        toast.error(validationErrors.map((e) => e.message).join('. '));
      } else {
        const message =
          axiosErr.response?.data?.message ||
          (err instanceof Error ? err.message : 'Registration failed. Please try again.');
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/seller/apply" replace />;
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Seller Account</CardTitle>
            <CardDescription>
              Step 1 of 2 — your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-accent/50 p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                You'll share your shop and craft details in the next step, which
                will be reviewed by our team.
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="First name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1 text-xs ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Continue to Shop Setup
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Just shopping?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create a customer account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuthShell>
  );
}