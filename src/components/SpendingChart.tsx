import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SpendingChart() {
  // Generate predictive spending data
  const generatePredictiveData = () => {
    const currentDate = new Date();
    const months = [];
    const actualSpending = [2845, 3120, 2967]; // Last 3 months actual
    const projectedSpending = [];

    // Generate last 3 months
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Generate next 3 months with trend
    const avgSpending = actualSpending.reduce((a, b) => a + b, 0) / actualSpending.length;
    const trendIncrease = 0.05; // 5% increase trend

    for (let i = 1; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      projectedSpending.push(Math.round(avgSpending * (1 + trendIncrease * i)));
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Actual Spending',
          data: [...actualSpending, null, null, null],
          borderColor: 'hsl(217, 91%, 60%)',
          backgroundColor: 'hsl(217, 91%, 60%, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(217, 91%, 60%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
        {
          label: 'Projected Spending',
          data: [null, null, actualSpending[2], ...projectedSpending],
          borderColor: 'hsl(142, 76%, 36%)',
          backgroundColor: 'hsl(142, 76%, 36%, 0.1)',
          borderDash: [5, 5],
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'hsl(142, 76%, 36%)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y?.toLocaleString() || 'N/A'}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount ($)',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'hsl(226, 232, 240, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Spending Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={generatePredictiveData()} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <p className="text-primary font-semibold">Current Trend</p>
            <p className="text-xs text-muted-foreground">+5% monthly increase</p>
          </div>
          <div className="text-center p-3 bg-secondary/10 rounded-lg">
            <p className="text-secondary font-semibold">Next Month</p>
            <p className="text-xs text-muted-foreground">Projected: $3,115</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}