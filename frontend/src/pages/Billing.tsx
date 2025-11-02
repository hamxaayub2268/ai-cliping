import { useState } from "react";
import { Check, CreditCard, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Billing = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? 10 : 100,
      description: "Perfect for individuals and small projects",
      features: [
        "Up to 5 projects per month",
        "500 minutes of video processing",
        "Basic AI features",
        "5 languages supported",
        "Email support"
      ],
      current: false
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 30 : 300,
      description: "Best for professionals and growing teams",
      features: [
        "Up to 25 projects per month",
        "2000 minutes of video processing",
        "Advanced AI features",
        "15 languages supported", 
        "Priority support",
        "Custom branding",
        "API access"
      ],
      current: true,
      popular: true
    },
    {
      name: "Agency",
      price: billingCycle === "monthly" ? 99 : 990,
      description: "For agencies and large organizations",
      features: [
        "Unlimited projects",
        "10000 minutes of video processing",
        "All AI features",
        "50+ languages supported",
        "24/7 phone support",
        "White-label solution",
        "Advanced API access",
        "Dedicated account manager"
      ],
      current: false
    }
  ];

  const usage = {
    videoMinutes: { current: 120, limit: 2000 },
    projects: { current: 8, limit: 25 },
    translations: { current: 45, limit: 100 }
  };

  const invoices = [
    {
      id: "INV-001",
      date: "Dec 1, 2024",
      amount: "$30.00",
      status: "Paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-002", 
      date: "Nov 1, 2024",
      amount: "$30.00",
      status: "Paid",
      plan: "Pro Plan"
    },
    {
      id: "INV-003",
      date: "Oct 1, 2024", 
      amount: "$30.00",
      status: "Paid",
      plan: "Pro Plan"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and track your usage
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card className="gradient-glow border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">Pro Plan</Badge>
              </CardTitle>
              <CardDescription>
                Your subscription renews on January 1, 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">$30.00</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Video Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.videoMinutes.current} / {usage.videoMinutes.limit} minutes</span>
                    <span>{Math.round((usage.videoMinutes.current / usage.videoMinutes.limit) * 100)}%</span>
                  </div>
                  <Progress value={(usage.videoMinutes.current / usage.videoMinutes.limit) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projects This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.projects.current} / {usage.projects.limit} projects</span>
                    <span>{Math.round((usage.projects.current / usage.projects.limit) * 100)}%</span>
                  </div>
                  <Progress value={(usage.projects.current / usage.projects.limit) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI Translations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.translations.current} / {usage.translations.limit} translations</span>
                    <span>{Math.round((usage.translations.current / usage.translations.limit) * 100)}%</span>
                  </div>
                  <Progress value={(usage.translations.current / usage.translations.limit) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="bg-muted p-1 rounded-lg">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly (Save 20%)
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'gradient-glow border-primary/20' : ''} ${plan.current ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 gradient-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.current && <Badge variant="secondary">Current</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant={plan.current ? "outline" : "hero"}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoice History</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </CardTitle>
              <CardDescription>
                Your payment history and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.plan}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.id} • {invoice.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;