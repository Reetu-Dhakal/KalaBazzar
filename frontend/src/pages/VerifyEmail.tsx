import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MailCheck, MailX, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { usePageTitle } from '@/hooks/usePageTitle';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  usePageTitle('Verify Email — कलाbazzar');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle',
  );
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const verify = async (checkToken: string) => {
    setStatus('verifying');
    try {
      await api.post('/auth/verify-email', { token: checkToken });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      verify(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email: resendEmail.trim() });
      setResendSent(true);
      toast.success('Verification email sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardContent className="p-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-heading text-foreground mb-2">Verifying your email...</h1>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Email verified!</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your account is now verified. You can log in and start shopping.
              </p>
              <Button size="lg" asChild>
                <Link to="/login">Continue to Login</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <MailX className="h-7 w-7 text-red-600" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Verification failed</h1>
              <p className="text-sm text-muted-foreground mb-6">
                The link is invalid or has expired. Enter your email below to receive a new one.
              </p>
              {!resendSent ? (
                <form onSubmit={handleResend} className="text-left space-y-3">
                  <Input
                    label="Email address"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isResending}>
                    Resend Verification Email
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-emerald-600">Verification email sent — check your inbox.</p>
              )}
              <div className="mt-4">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}

          {status === 'idle' && (
            <>
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-heading text-foreground mb-2">Check your email</h1>
              <p className="text-sm text-muted-foreground mb-6">
                We sent you a verification link. Click it to activate your account, then log in.
                Didn't receive it? Resend below.
              </p>
              {!resendSent ? (
                <form onSubmit={handleResend} className="text-left space-y-3">
                  <Input
                    label="Email address"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isResending}>
                    Resend Verification Email
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-emerald-600">Verification email sent — check your inbox.</p>
              )}
              <div className="mt-4">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}