import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useSubscription, SUBSCRIPTION_PLANS } from '@/contexts/SubscriptionContext';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  showUpgrade?: boolean;
}

const PremiumGate = ({ 
  children, 
  feature, 
  description, 
  showUpgrade = true 
}: PremiumGateProps) => {
  const { subscribed, createCheckout, loading } = useSubscription();

  if (subscribed) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Lock className="h-5 w-5" />
          Premium Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">{feature}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {showUpgrade && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Upgrade to unlock this feature</p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={() => createCheckout(SUBSCRIPTION_PLANS.monthly.priceId)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Monthly $7.99
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createCheckout(SUBSCRIPTION_PLANS.yearly.priceId)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Yearly $59.99
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumGate;