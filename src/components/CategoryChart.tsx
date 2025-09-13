import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface CategoryChartProps {
  transactions: Transaction[];
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const generateCategoryData = () => {
    // Get current month transactions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    // Calculate spending by category
    const categoryTotals = monthlyTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Add sample data if no transactions exist
    if (Object.keys(categoryTotals).length === 0) {
      return {
        labels: ['Groceries', 'Transportation', 'Dining', 'Utilities', 'Entertainment'],
        datasets: [
          {
            data: [450, 230, 180, 150, 120],
            backgroundColor: [
              'hsl(217, 91%, 60%)',
              'hsl(142, 76%, 36%)',
              'hsl(45, 93%, 58%)',
              'hsl(0, 84%, 60%)',
              'hsl(262, 83%, 58%)',
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBackgroundColor: [
              'hsl(217, 91%, 70%)',
              'hsl(142, 76%, 46%)',
              'hsl(45, 93%, 68%)',
              'hsl(0, 84%, 70%)',
              'hsl(262, 83%, 68%)',
            ],
          },
        ],
      };
    }

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Generate colors for each category
    const colors = [
      'hsl(217, 91%, 60%)',
      'hsl(142, 76%, 36%)',
      'hsl(45, 93%, 58%)',
      'hsl(0, 84%, 60%)',
      'hsl(262, 83%, 58%)',
      'hsl(300, 76%, 46%)',
      'hsl(24, 95%, 58%)',
      'hsl(173, 58%, 39%)',
    ];

    const hoverColors = [
      'hsl(217, 91%, 70%)',
      'hsl(142, 76%, 46%)',
      'hsl(45, 93%, 68%)',
      'hsl(0, 84%, 70%)',
      'hsl(262, 83%, 68%)',
      'hsl(300, 76%, 56%)',
      'hsl(24, 95%, 68%)',
      'hsl(173, 58%, 49%)',
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverBackgroundColor: hoverColors.slice(0, labels.length),
          hoverBorderWidth: 3,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const percentage = ((value / dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
                return {
                  text: `${label}: $${value.toFixed(2)} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
            const currentValue = dataset.data[context.dataIndex];
            const percentage = ((currentValue / total) * 100).toFixed(1);
            return `${context.label}: $${currentValue.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  const chartData = generateCategoryData();
  const totalSpent = chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0);

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-accent" />
          <span>Spending by Category</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px]">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">Categories</p>
            <p>{chartData.labels.length}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">This Month</p>
            <p>${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}