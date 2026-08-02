import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  usePageTitle('Order Confirmed');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="relative inline-block mb-6">
          <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="h-14 w-14 text-emerald-600" />
          </div>
          <div className="absolute inset-0 h-24 w-24 rounded-full bg-emerald-50 animate-ping opacity-20 mx-auto" />
        </div>

        <h1 className="text-3xl font-heading text-foreground mb-3">
          Thank you for your order!
        </h1>
        <p className="text-muted-foreground mb-2">
          Your order has been placed successfully.
        </p>
        {id && (
          <p className="text-sm text-muted-foreground mb-8">
            Order number: <span className="font-mono font-semibold text-foreground">{id.slice(-8).toUpperCase()}</span>
          </p>
        )}

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">What happens next?</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-muted-foreground">
                  We'll review your order and confirm it shortly.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-muted-foreground">
                  You'll receive an email confirmation with order details.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-muted-foreground">
                  Track your order status from your account dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {id && (
            <Button size="lg" asChild>
              <Link to={`/orders/${id}`}>
                <Package className="h-5 w-5" />
                View Order Details
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link to="/shop">
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
