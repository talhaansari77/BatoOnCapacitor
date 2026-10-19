import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  DollarSign,
  Gift,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Keep disabled until a processor-backed server settlement replaces this legacy flow.
const PAYMENTS_ENABLED = false;
const roundMoney = amount => Math.round((amount + Number.EPSILON) * 100) / 100;

const LOYALTY_DISCOUNTS = {
  bronze: 0,
  silver: 5,
  gold: 10,
  platinum: 15,
  diamond: 20
};

export default function PaymentCheckout({ invoice, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });
  const [applyRewards, setApplyRewards] = useState(false);
  const [applyLoyaltyDiscount, setApplyLoyaltyDiscount] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Fetch available referral rewards
  const { data: availableRewards } = useQuery({
    queryKey: ['availableRewards', user?.email],
    queryFn: async () => {
      const referrals = await base44.entities.Referral.filter({
        referrer_email: user.email,
        status: 'first_session_completed',
        reward_claimed: false
      });
      return referrals.filter(r => r.reward_type === 'cash_credit');
    },
    enabled: !!user,
    initialData: [],
  });

  // Fetch client lifecycle for loyalty discount
  const { data: clientLifecycle } = useQuery({
    queryKey: ['clientLifecycle', user?.email],
    queryFn: async () => {
      const lifecycle = await base44.entities.ClientLifecycle.filter({ 
        client_email: user.email 
      });
      return lifecycle[0] || null;
    },
    enabled: !!user,
    initialData: null,
  });

  // Calculate totals
  const availableRewardAmount = availableRewards.reduce((sum, r) => sum + (r.reward_amount || 0), 0);
  const loyaltyDiscountPercent = clientLifecycle?.loyalty_level 
    ? LOYALTY_DISCOUNTS[clientLifecycle.loyalty_level] 
    : 0;
  
  const subtotal = invoice.balance_due || 0;
  const rewardDiscount = applyRewards ? Math.min(availableRewardAmount, subtotal) : 0;
  const loyaltyDiscount = applyLoyaltyDiscount 
    ? ((subtotal - rewardDiscount) * loyaltyDiscountPercent / 100) 
    : 0;
  const finalAmount = roundMoney(Math.max(0, subtotal - rewardDiscount - loyaltyDiscount));

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      if (!PAYMENTS_ENABLED) {
        throw new Error('Online payments are not available yet. Please contact BATO to arrange payment.');
      }
      
      // Create payment record
      const payment = await base44.entities.Payment.create({
        client_email: user.email,
        invoice_id: invoice.id,
        amount: finalAmount,
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod,
        status: 'success',
        transaction_id: `TXN-${Date.now()}`,
        card_last_four: paymentMethod === 'credit_card' ? cardDetails.number.slice(-4) : null,
        notes: `Payment processed via ${paymentMethod}. ${applyRewards ? `Referral rewards applied: $${rewardDiscount}. ` : ''}${applyLoyaltyDiscount ? `Loyalty discount applied: $${loyaltyDiscount.toFixed(2)}. ` : ''}`
      });

      // Update invoice
      const newAmountPaid = (invoice.amount_paid || 0) + finalAmount;
      const newBalanceDue = roundMoney(Math.max(0, subtotal - finalAmount - rewardDiscount - loyaltyDiscount));
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partially_paid';

      await base44.entities.Invoice.update(invoice.id, {
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus,
        discount_amount: (invoice.discount_amount || 0) + rewardDiscount + loyaltyDiscount,
        discount_type: applyRewards ? 'referral_reward' : applyLoyaltyDiscount ? 'loyalty_discount' : invoice.discount_type
      });

      // Mark referral rewards as claimed
      if (applyRewards && availableRewards.length > 0) {
        let remainingToApply = rewardDiscount;
        for (const referral of availableRewards) {
          if (remainingToApply <= 0) break;
          
          const amountToUse = Math.min(referral.reward_amount, remainingToApply);
          const rewardRemaining = roundMoney(Math.max(0, referral.reward_amount - amountToUse));
          await base44.entities.Referral.update(referral.id, {
            reward_amount: rewardRemaining,
            reward_claimed: rewardRemaining === 0,
            reward_claimed_date: rewardRemaining === 0 ? new Date().toISOString() : null
          });
          remainingToApply -= amountToUse;
        }
      }

      // Award loyalty points for payment
      if (clientLifecycle) {
        const pointsEarned = Math.floor(finalAmount * 10); // 10 points per dollar
        await base44.entities.ClientLifecycle.update(clientLifecycle.id, {
          loyalty_points: (clientLifecycle.loyalty_points || 0) + pointsEarned
        });

        // Create notification
        await base44.entities.Notification.create({
          client_email: user.email,
          type: 'general',
          title: '💰 Payment Successful',
          message: `Your payment of $${finalAmount.toFixed(2)} has been processed successfully. You earned ${pointsEarned} loyalty points!`,
          priority: 'normal'
        });
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['availableRewards'] });
      queryClient.invalidateQueries({ queryKey: ['clientLifecycle'] });
      toast.success('Payment processed successfully!');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  });

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: value });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardDetails({ ...cardDetails, expiry: value });
  };

  const handleCvcChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardDetails({ ...cardDetails, cvc: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        toast.error('Please fill in all card details');
        return;
      }
      if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        toast.error('Invalid card number');
        return;
      }
    }

    setProcessing(true);
    processPaymentMutation.mutate();
  };

  if (!PAYMENTS_ENABLED) {
    return (
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Online payments coming soon</h2>
        <p className="text-sm text-gray-600">Please contact BATO to arrange payment for this invoice. No payment has been taken and your balance has not changed.</p>
        <Button variant="outline" onClick={onCancel}>Close</Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Invoice Amount</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          
          {rewardDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Referral Rewards
              </span>
              <span className="font-semibold">-${rewardDiscount.toFixed(2)}</span>
            </div>
          )}
          
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-purple-600">
              <span className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Loyalty Discount ({loyaltyDiscountPercent}%)
              </span>
              <span className="font-semibold">-${loyaltyDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-cyan-200 flex justify-between text-xl font-bold text-gray-900">
            <span>Total to Pay</span>
            <span className="text-cyan-600">${finalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Available Discounts */}
      {(availableRewardAmount > 0 || loyaltyDiscountPercent > 0) && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Available Discounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableRewardAmount > 0 && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="apply-rewards"
                  checked={applyRewards}
                  onCheckedChange={setApplyRewards}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="apply-rewards" className="font-semibold text-gray-900 cursor-pointer">
                    Apply Referral Rewards
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    You have ${availableRewardAmount} in referral rewards available
                  </p>
                  <Badge className="mt-2 bg-green-500 text-white">
                    Save ${Math.min(availableRewardAmount, subtotal).toFixed(2)}
                  </Badge>
                </div>
              </div>
            )}

            {loyaltyDiscountPercent > 0 && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="apply-loyalty"
                  checked={applyLoyaltyDiscount}
                  onCheckedChange={setApplyLoyaltyDiscount}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="apply-loyalty" className="font-semibold text-gray-900 cursor-pointer">
                    Apply Loyalty Discount
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    As a {clientLifecycle?.loyalty_level || 'bronze'} member, get {loyaltyDiscountPercent}% off
                  </p>
                  <Badge className="mt-2 bg-purple-500 text-white">
                    Save ${((subtotal - (applyRewards ? rewardDiscount : 0)) * loyaltyDiscountPercent / 100).toFixed(2)}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-4 border-2 rounded-xl transition-all ${
                paymentMethod === 'credit_card'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
              <p className="font-semibold text-gray-900">Credit Card</p>
              <p className="text-xs text-gray-600 mt-1">Visa, Mastercard, Amex</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('debit_card')}
              className={`p-4 border-2 rounded-xl transition-all ${
                paymentMethod === 'debit_card'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-gray-900">Debit Card</p>
              <p className="text-xs text-gray-600 mt-1">Bank debit cards</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-4 border-2 rounded-xl transition-all ${
                paymentMethod === 'bank_transfer'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-gray-900">Bank Transfer</p>
              <p className="text-xs text-gray-600 mt-1">Direct transfer</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="mt-1 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="card-expiry">Expiry Date</Label>
                      <Input
                        id="card-expiry"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-cvc">CVC</Label>
                      <Input
                        id="card-cvc"
                        value={cardDetails.cvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900">
                      Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                    </p>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Instructions</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Bank Name:</strong> HairRevive Business Account</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Routing Number:</strong> 987654321</p>
                    <p><strong>Reference:</strong> Invoice #{invoice.invoice_number}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Please include the invoice number in your transfer reference. Payment confirmation may take 1-3 business days.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing || finalAmount <= 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay ${finalAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Secure Payment</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-900">
            <p className="font-semibold mb-1">Demo Mode</p>
            <p>
              This is a demonstration of the payment flow. In production, this will integrate with Stripe and PayPal for secure payment processing. No real charges will be made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}