import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, TrendingUp, Target, AlertTriangle, DollarSign, ShoppingCart, Car, Coffee, Home, Zap, Gamepad2, Heart, UserCircle } from 'lucide-react';
import { SpendingChart } from './SpendingChart';
import { CategoryChart } from './CategoryChart';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

interface BudgetAlert {
  category: string;
  budgetLimit: number;
  currentSpent: number;
  overage: number;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Groceries': ShoppingCart,
  'Transportation': Car,
  'Dining': Coffee,
  'Utilities': Home,
  'Bills': Zap,
  'Entertainment': Gamepad2,
  'Healthcare': Heart,
  'Shopping': ShoppingCart,
  'Other': DollarSign,
};

const categoryMapping: Record<string, string> = {
  'grocery': 'Groceries',
  'supermarket': 'Groceries',
  'food': 'Groceries',
  'uber': 'Transportation',
  'gas': 'Transportation',
  'taxi': 'Transportation',
  'restaurant': 'Dining',
  'cafe': 'Dining',
  'coffee': 'Dining',
  'pizza': 'Dining',
  'electric': 'Utilities',
  'water': 'Utilities',
  'internet': 'Utilities',
  'phone': 'Bills',
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'movie': 'Entertainment',
  'amazon': 'Shopping',
  'target': 'Shopping',
  'doctor': 'Healthcare',
  'pharmacy': 'Healthcare',
};

const budgetLimits: Record<string, number> = {
  'Groceries': 600,
  'Transportation': 300,
  'Dining': 400,
  'Utilities': 200,
  'Bills': 150,
  'Entertainment': 250,
  'Healthcare': 100,
  'Shopping': 500,
};

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', date: '' });
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', currentAmount: '' });
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateBudgetAlerts();
  }, [transactions]);

  const loadData = () => {
    const savedTransactions = localStorage.getItem('finsmartai_transactions');
    const savedGoals = localStorage.getItem('finsmartai_goals');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Sample data
      const sampleTransactions: Transaction[] = [
        { id: '1', description: 'Grocery Store Purchase', amount: 87.32, date: '2024-01-15', category: 'Groceries' },
        { id: '2', description: 'Uber Ride', amount: 23.45, date: '2024-01-14', category: 'Transportation' },
        { id: '3', description: 'Netflix Subscription', amount: 15.99, date: '2024-01-13', category: 'Entertainment' },
        { id: '4', description: 'Electric Bill', amount: 145.67, date: '2024-01-12', category: 'Utilities' },
        { id: '5', description: 'Coffee Shop', amount: 8.75, date: '2024-01-11', category: 'Dining' },
        { id: '6', description: 'Amazon Purchase', amount: 67.89, date: '2024-01-10', category: 'Shopping' },
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('finsmartai_transactions', JSON.stringify(sampleTransactions));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Sample goals
      const sampleGoals: Goal[] = [
        { id: '1', name: 'Emergency Fund', targetAmount: 5000, currentAmount: 3200 },
        { id: '2', name: 'Vacation to Europe', targetAmount: 3000, currentAmount: 1800 },
        { id: '3', name: 'New Laptop', targetAmount: 1500, currentAmount: 750 },
      ];
      setGoals(sampleGoals);
      localStorage.setItem('finsmartai_goals', JSON.stringify(sampleGoals));
    }
  };

  const categorizeTransaction = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMapping)) {
      if (lowerDesc.includes(keyword)) {
        return category;
      }
    }
    return 'Other';
  };

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      date: newTransaction.date,
      category: categorizeTransaction(newTransaction.description),
    };

    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('finsmartai_transactions', JSON.stringify(updatedTransactions));
    setNewTransaction({ description: '', amount: '', date: '' });
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem('finsmartai_goals', JSON.stringify(updatedGoals));
    setNewGoal({ name: '', targetAmount: '', currentAmount: '' });
  };

  const calculateBudgetAlerts = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const alerts: BudgetAlert[] = [];
    for (const [category, spent] of Object.entries(monthlySpending)) {
      const budget = budgetLimits[category];
      if (budget && spent > budget) {
        alerts.push({
          category,
          budgetLimit: budget,
          currentSpent: spent,
          overage: spent - budget,
        });
      }
    }

    setBudgetAlerts(alerts);
  };

  const totalBalance = 8347.52;
  const monthlyIncome = 4200;

  return (
    <div className="min-h-screen bg-gradient-dashboard p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm rounded-lg p-6 shadow-financial">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-financial rounded-full flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Welcome back, Alex!</h1>
              <p className="text-muted-foreground">Here's your financial overview</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-card-foreground">${totalBalance.toLocaleString()}</p>
            <p className="text-muted-foreground">Total Balance</p>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="mb-6">
          {budgetAlerts.map((alert, index) => (
            <Alert key={index} className="mb-2 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>{alert.category}</strong> budget exceeded by ${alert.overage.toFixed(2)}! 
                Spent ${alert.currentSpent.toFixed(2)} of ${alert.budgetLimit.toFixed(2)} budget.
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Add Transaction */}
        <Card className="card-financial">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <span>Add Transaction</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Grocery store purchase"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <Button onClick={addTransaction} className="w-full bg-gradient-financial">
              Add Transaction
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="card-financial">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span>Monthly Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income</span>
                <span className="font-semibold text-secondary">${monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-semibold text-destructive">
                  ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Net Income</span>
                <span className="text-secondary">
                  ${(monthlyIncome - transactions.reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="card-financial">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions This Month</span>
                <span className="font-semibold">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Goals</span>
                <span className="font-semibold">{goals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Alerts</span>
                <span className="font-semibold text-destructive">{budgetAlerts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SpendingChart />
        <CategoryChart transactions={transactions} />
      </div>

      {/* Recent Transactions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="card-financial">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => {
                const IconComponent = categoryIcons[transaction.category] || DollarSign;
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{transaction.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-destructive">-${transaction.amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card className="card-financial">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-accent" />
              <span>Financial Goals</span>
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Add Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Financial Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input
                      id="goalName"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentAmount">Current Amount (Optional)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <Button onClick={addGoal} className="w-full bg-gradient-success">
                    Add Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-card-foreground">{goal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}