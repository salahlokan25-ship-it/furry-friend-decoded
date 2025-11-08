import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles } from 'lucide-react';
import { useSubscription, SUBSCRIPTION_PLANS } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

interface SubscriptionPlansProps {
  onComplete?: () => void;
  showTitle?: boolean;
}

const SubscriptionPlans = ({ onComplete, showTitle = true }: SubscriptionPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const { createCheckout, subscribed, plan, loading } = useSubscription();

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    await createCheckout(SUBSCRIPTION_PLANS[planType].priceId);
  };

  const handleContinueFree = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const features = {
    free: [
      '3 translations per day',
      '3 AI chats per day',
      'Basic training courses',
      'Photo album (limited)',
    ],
    premium: [
      'Unlimited translations',
      'Unlimited AI chats',
      'Advanced training courses',
      'Unlimited photo storage',
      'Premium pet games',
      'Priority support',
      'Exclusive content',
      'Mood interpreter',
    ]
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {showTitle && (
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground">
            Unlock premium features for the best pet experience
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <Card className={cn(
          "relative transition-all duration-300 hover:shadow-lg",
          plan === 'free' && subscribed === false ? "ring-2 ring-primary" : ""
        )}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              Free
            </CardTitle>
            <div className="space-y-1">
              <p className="text-3xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">Forever</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleContinueFree}
              disabled={loading}
            >
              Continue Free
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className={cn(
          "relative transition-all duration-300 hover:shadow-lg border-primary/20",
          plan === 'monthly' && subscribed ? "ring-2 ring-primary" : ""
        )}>
          <CardHeader className="text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Popular</Badge>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Premium Monthly
            </CardTitle>
            <div className="space-y-1">
              <p className="text-3xl font-bold">$9.99</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => handleSubscribe('monthly')}
              disabled={loading}
            >
              {plan === 'monthly' && subscribed ? 'Current Plan' : 'Subscribe Monthly'}
            </Button>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className={cn(
          "relative transition-all duration-300 hover:shadow-lg border-accent/20",
          plan === 'yearly' && subscribed ? "ring-2 ring-accent" : ""
        )}>
          <CardHeader className="text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-500 text-white">Save 37%</Badge>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              Premium Yearly
            </CardTitle>
            <div className="space-y-1">
              <p className="text-3xl font-bold">$59.99</p>
              <p className="text-sm text-muted-foreground">per year</p>
              <p className="text-xs text-green-600 font-medium">Save $36 annually!</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full bg-accent hover:bg-accent/90"
              onClick={() => handleSubscribe('yearly')}
              disabled={loading}
            >
              {plan === 'yearly' && subscribed ? 'Current Plan' : 'Subscribe Yearly'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>Cancel anytime • No hidden fees • 30-day money-back guarantee</p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;