import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineCog,
  HiOutlineMap,
  HiOutlinePhone,
} from 'react-icons/hi';
import API from '../utils/axios';
import { Button, Container, LoadingSkeleton } from '../components/ui';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  pending: HiOutlineClock,
  confirmed: HiOutlineCheckCircle,
  processing: HiOutlineCog,
  shipped: HiOutlineTruck,
  delivered: HiOutlineCheckCircle,
  cancelled: HiOutlineXCircle,
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <Container>
          <div className="py-8">
            <LoadingSkeleton variant="text" count={5} />
          </div>
        </Container>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-24">
        <Container>
          <div className="py-16 text-center">
            <p className="text-text-muted mb-4">{error || 'Order not found'}</p>
            <Link to="/dashboard">
              <Button variant="outline" icon={HiOutlineArrowLeft}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.orderStatus] || HiOutlineClock;
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="min-h-screen pt-24">
      <Container>
        <div className="py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-4">
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-text">
                  Order #{order.invoiceNumber || order._id.slice(-6)}
                </h1>
                <p className="text-text-muted mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full capitalize self-start ${statusColors[order.orderStatus] || ''}`}>
                <StatusIcon className="w-4 h-4" />
                {order.orderStatus}
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Tracker */}
              {!isCancelled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-border/50 p-6"
                >
                  <h2 className="font-heading text-lg font-semibold text-text mb-6">Order Progress</h2>
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, idx) => {
                      const reached = idx <= currentStepIndex;
                      const StepIcon = statusIcons[step] || HiOutlineClock;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                            reached ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs capitalize ${reached ? 'text-primary font-medium' : 'text-text-muted'}`}>
                            {step}
                          </span>
                          {idx < statusSteps.length - 1 && (
                            <div className={`absolute h-0.5 w-full ${
                              idx < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {isCancelled && order.cancellationReason && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 rounded-2xl border border-red-200 p-6"
                >
                  <h2 className="font-heading text-lg font-semibold text-red-700 mb-2">Order Cancelled</h2>
                  <p className="text-red-600 text-sm">{order.cancellationReason}</p>
                </motion.div>
              )}

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-text mb-4">Items</h2>
                <div className="space-y-4">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{item.name}</p>
                        <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-heading font-semibold text-primary shrink-0">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-border/50 p-6"
                >
                  <h2 className="font-heading text-lg font-semibold text-text mb-4">Shipping Address</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-text">
                      <HiOutlineMap className="w-4 h-4 text-primary shrink-0" />
                      <span>{order.shippingAddress.fullName}</span>
                    </div>
                    <p className="text-text-muted pl-6">{order.shippingAddress.street}</p>
                    <p className="text-text-muted pl-6">
                      {[order.shippingAddress.city, order.shippingAddress.district].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-text-muted pl-6">
                      {[order.shippingAddress.province, order.shippingAddress.zipCode].filter(Boolean).join(' ')}
                    </p>
                    {order.shippingAddress.phone && (
                      <div className="flex items-center gap-2 text-text-muted pt-2">
                        <HiOutlinePhone className="w-4 h-4 shrink-0" />
                        <span>{order.shippingAddress.phone}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-text mb-4">Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text font-medium">Rs. {order.itemsPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    <span className="text-text font-medium">
                      {order.shippingPrice === 0 ? 'Free' : `Rs. ${order.shippingPrice?.toLocaleString()}`}
                    </span>
                  </div>
                  {order.taxPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tax</span>
                      <span className="text-text font-medium">Rs. {order.taxPrice?.toLocaleString()}</span>
                    </div>
                  )}
                  {order.discountPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Discount</span>
                      <span className="text-green-600 font-medium">- Rs. {order.discountPrice?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-text">Total</span>
                    <span className="font-heading font-semibold text-primary">
                      Rs. {order.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-text mb-4">Payment</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Method</span>
                    <span className="text-text font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status</span>
                    <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Paid on</span>
                      <span className="text-text">
                        {new Date(order.paidAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {order.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Invoice</span>
                      <span className="text-text font-mono text-xs">{order.invoiceNumber}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Delivery Estimate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <h2 className="font-heading text-lg font-semibold text-text mb-3">Delivery</h2>
                {order.deliveredAt ? (
                  <p className="text-sm text-green-600 font-medium">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    Estimated delivery: 5-7 business days after confirmation
                  </p>
                )}
              </motion.div>

              {/* Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-background rounded-2xl p-6 text-center"
              >
                <p className="text-sm text-text-muted mb-3">Need help with this order?</p>
                <Link to="/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderDetail;
