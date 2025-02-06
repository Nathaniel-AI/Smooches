import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";
import type { Transaction, Earnings, Subscription } from "@shared/schema";

const COLORS = ["#FF4B91", "#FFB4B4", "#FFDCB8", "#C7DCA7"];

export default function MonetizationDashboard() {
  const { data: earnings } = useQuery<Earnings[]>({
    queryKey: ["/api/earnings"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: subscriptions } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const earningsByType = earnings?.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.entries(earningsByType).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyEarnings = earnings?.reduce((acc, curr) => {
    acc[curr.month] = (acc[curr.month] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>) || {};

  const barData = Object.entries(monthlyEarnings).map(([month, amount]) => ({
    month,
    amount
  }));

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${earnings?.reduce((sum, e) => sum + Number(e.amount), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {subscriptions?.filter(s => s.status === 'active').length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">+12.5%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${transactions?.filter(t => t.type === 'tip').reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="amount" fill="#FF4B91" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 bg-accent/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <p className="text-xl font-bold">${Number(transaction.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
