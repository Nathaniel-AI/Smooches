import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, BarChart, Area, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ArrowUpRight, TrendingUp, DollarSign, Users, Clock, Award } from "lucide-react";

import { mockEarnings, mockTransactions } from "@/lib/mock-data";
import type { Earnings, Transaction } from "@shared/schema";

interface EarningsSummary {
  total: number;
  subscriptions: number;
  tips: number;
  clips: number;
  adsRevenue: number;
}

export function EarningsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  
  // Fetch earnings data
  const { data: earnings, isLoading: earningsLoading } = useQuery<Earnings[]>({
    queryKey: ["/api/earnings"],
    enabled: true,
  });

  // Fetch transactions data
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: true,
  });

  // If data is not available yet, use mock data for demonstration
  const earningsData: Earnings[] = earnings || mockEarnings;
  const transactionsData: Transaction[] = transactions || mockTransactions;

  // Calculate earnings summary
  const calculateEarningsSummary = (): EarningsSummary => {
    return {
      total: earningsData.reduce((sum: number, item: Earnings) => sum + parseFloat(item.amount), 0),
      subscriptions: earningsData.filter((item: Earnings) => item.type === 'subscription')
        .reduce((sum: number, item: Earnings) => sum + parseFloat(item.amount), 0),
      tips: earningsData.filter((item: Earnings) => item.type === 'tip')
        .reduce((sum: number, item: Earnings) => sum + parseFloat(item.amount), 0),
      clips: earningsData.filter((item: Earnings) => item.type === 'clip')
        .reduce((sum: number, item: Earnings) => sum + parseFloat(item.amount), 0),
      adsRevenue: earningsData.filter((item: Earnings) => item.type === 'ad')
        .reduce((sum: number, item: Earnings) => sum + parseFloat(item.amount), 0),
    };
  };

  const summary = calculateEarningsSummary();

  // Prepare chart data
  const prepareChartData = () => {
    // Group earnings by month
    const groupedByMonth: Record<string, Record<string, number>> = {};
    
    earningsData.forEach((earning: Earnings) => {
      const month = earning.month || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = {
          subscription: 0,
          tip: 0,
          clip: 0,
          ad: 0
        };
      }
      groupedByMonth[month][earning.type] += parseFloat(earning.amount);
    });

    // Convert to chart format
    return Object.entries(groupedByMonth).map(([month, types]) => ({
      month,
      subscription: types.subscription || 0,
      tip: types.tip || 0,
      clip: types.clip || 0,
      ad: types.ad || 0,
    })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12); // Get last 12 months
  };

  const chartData = prepareChartData();

  // Format month for display
  const formatMonth = (month: string) => {
    const date = new Date(month + "-01");
    return date.toLocaleDateString(undefined, { month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Creator Monetization</h1>
        <p className="text-muted-foreground">
          Monitor your earnings, subscriptions, tips, and ads revenue.
        </p>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.subscriptions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              27 active subscribers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tips & Donations</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.tips.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              54 tips received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Content Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summary.clips + summary.adsRevenue).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From clips and ad revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
          <CardDescription>
            View your earnings across different revenue streams
          </CardDescription>
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="week" onClick={() => setTimeRange("week")}>Weekly</TabsTrigger>
              <TabsTrigger value="month" onClick={() => setTimeRange("month")} defaultChecked>Monthly</TabsTrigger>
              <TabsTrigger value="year" onClick={() => setTimeRange("year")}>Yearly</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            <ChartContainer 
              config={{
                subscription: {
                  label: "Subscriptions",
                  color: "#8884d8"
                },
                tip: {
                  label: "Tips & Donations",
                  color: "#82ca9d"
                },
                clip: {
                  label: "Clips",
                  color: "#ffc658"
                },
                ad: {
                  label: "Ad Revenue",
                  color: "#ff8042"
                }
              }}
            >
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [`$${value}`, name]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="subscription"
                  stackId="1"
                  stroke="var(--color-subscription)"
                  fill="var(--color-subscription)"
                />
                <Area
                  type="monotone"
                  dataKey="tip"
                  stackId="1"
                  stroke="var(--color-tip)"
                  fill="var(--color-tip)"
                />
                <Area
                  type="monotone"
                  dataKey="clip"
                  stackId="1"
                  stroke="var(--color-clip)"
                  fill="var(--color-clip)"
                />
                <Area
                  type="monotone"
                  dataKey="ad"
                  stackId="1"
                  stroke="var(--color-ad)"
                  fill="var(--color-ad)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest earnings and payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {transactionsData.slice(0, 5).map((transaction, i) => (
              <div key={i} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.type === 'payout' ? 'Payout to Bank Account' : 
                     transaction.type === 'subscription' ? 'Subscription Payment' :
                     transaction.type === 'tip' ? 'Tip from Viewer' : 'Platform Payment'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.createdAt 
                      ? new Date(transaction.createdAt).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  <span className={transaction.type === 'payout' ? 'text-red-500' : 'text-green-500'}>
                    {transaction.type === 'payout' ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View All Transactions</Button>
        </CardFooter>
      </Card>

      {/* Payout Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Information</CardTitle>
          <CardDescription>
            Your next scheduled payout and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="font-medium">Next Scheduled Payout</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>April 15, 2025</span>
                <Badge variant="outline" className="ml-2">Pending</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated amount: ${summary.total.toFixed(2)}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <div className="font-medium">Payment Method</div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Bank Account (****1234)</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-fit">
                Update Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Opportunities */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>Growth Opportunity</AlertTitle>
        <AlertDescription>
          Boost your earnings by enabling clip suggestions on your radio shows.
          Creators who enable this feature earn 45% more on average.
          <Button variant="link" size="sm" className="px-0">
            Enable Now <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}