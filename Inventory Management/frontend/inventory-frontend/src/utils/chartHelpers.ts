import type { 
  StockMovementData, 
  TopProductData, 
  WarehouseDistributionData, 
  CategoryDistributionData 
} from '../types/dashboard';

// Chart color palettes
export const chartColors = {
  primary: ['#2196F3', '#1976D2', '#0D47A1', '#42A5F5', '#90CAF9'],
  success: ['#4CAF50', '#388E3C', '#2E7D32', '#66BB6A', '#A5D6A7'],
  warning: ['#FF9800', '#F57C00', '#EF6C00', '#FFB74D', '#FFCC02'],
  error: ['#F44336', '#D32F2F', '#C62828', '#EF5350', '#E57373'],
  neutral: ['#9E9E9E', '#757575', '#616161', '#BDBDBD', '#E0E0E0'],
};

// Get color by index
export const getColorByIndex = (index: number, palette: keyof typeof chartColors = 'primary'): string => {
  const colors = chartColors[palette];
  return colors[index % colors.length];
};

// Process stock movement data for line chart
export const processStockMovementData = (data: StockMovementData[]) => {
  return data.map(item => ({
    name: item.date,
    'Stock In': item.in,
    'Stock Out': item.out,
    'Net Change': item.net,
  }));
};

// Process top products data for bar chart
export const processTopProductsData = (data: TopProductData[], limit: number = 10) => {
  return data
    .slice(0, limit)
    .map(item => ({
      name: item.name,
      quantity: item.quantity,
      value: item.value,
      category: item.category,
    }));
};

// Process warehouse distribution data for pie chart
export const processWarehouseDistributionData = (data: WarehouseDistributionData[]) => {
  return data.map((item, index) => ({
    name: item.warehouse,
    value: item.products,
    percentage: item.percentage,
    color: getColorByIndex(index, 'primary'),
  }));
};

// Process category distribution data for pie chart
export const processCategoryDistributionData = (data: CategoryDistributionData[]) => {
  return data.map((item, index) => ({
    name: item.category,
    value: item.products,
    percentage: item.percentage,
    color: getColorByIndex(index, 'success'),
  }));
};

// Create performance metrics data
export const createPerformanceMetricsData = (metrics: {
  inventoryTurnover: number;
  stockAccuracy: number;
  orderFulfillment: number;
  supplierPerformance: number;
}) => {
  return [
    {
      name: 'Inventory Turnover',
      value: metrics.inventoryTurnover,
      target: 12, // Target: 12 times per year
      color: getColorByIndex(0, 'primary'),
    },
    {
      name: 'Stock Accuracy',
      value: metrics.stockAccuracy,
      target: 95, // Target: 95%
      color: getColorByIndex(1, 'success'),
    },
    {
      name: 'Order Fulfillment',
      value: metrics.orderFulfillment,
      target: 98, // Target: 98%
      color: getColorByIndex(2, 'warning'),
    },
    {
      name: 'Supplier Performance',
      value: metrics.supplierPerformance,
      target: 90, // Target: 90%
      color: getColorByIndex(3, 'error'),
    },
  ];
};

// Create trend data for metrics
export const createTrendData = (current: number, previous: number, periods: number = 12) => {
  const data = [];
  const change = current - previous;
  const step = change / periods;
  
  for (let i = 0; i < periods; i++) {
    data.push({
      period: `Period ${i + 1}`,
      value: previous + (step * i),
    });
  }
  
  return data;
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Format chart tooltip
export const formatChartTooltip = (value: any, name: string) => {
  if (typeof value === 'number') {
    if (name.includes('Percentage') || name.includes('Accuracy') || name.includes('Fulfillment')) {
      return [`${value.toFixed(1)}%`, name];
    }
    if (name.includes('Value') || name.includes('Cost')) {
      return [`$${value.toLocaleString()}`, name];
    }
    return [value.toLocaleString(), name];
  }
  return [value, name];
};

// Get chart responsiveness settings
export const getChartResponsiveness = () => ({
  width: '100%',
  height: 300,
  aspect: 2,
});

// Get pie chart settings
export const getPieChartSettings = () => ({
  cx: '50%',
  cy: '50%',
  outerRadius: 80,
  innerRadius: 40,
});

// Get bar chart settings
export const getBarChartSettings = () => ({
  barSize: 20,
  barGap: 2,
  barCategoryGap: 10,
});

// Get line chart settings
export const getLineChartSettings = () => ({
  strokeWidth: 2,
  dot: { r: 4 },
  activeDot: { r: 6 },
});

// Create gradient definitions for charts
export const createGradientDefs = () => [
  {
    id: 'primaryGradient',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    children: [
      { offset: '5%', stopColor: '#2196F3', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#1976D2', stopOpacity: 0.2 },
    ],
  },
  {
    id: 'successGradient',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    children: [
      { offset: '5%', stopColor: '#4CAF50', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#388E3C', stopOpacity: 0.2 },
    ],
  },
  {
    id: 'warningGradient',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1,
    children: [
      { offset: '5%', stopColor: '#FF9800', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#F57C00', stopOpacity: 0.2 },
    ],
  },
];

// Get chart animation settings
export const getChartAnimation = () => ({
  duration: 1000,
  easing: 'ease-in-out',
});

// Validate chart data
export const validateChartData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;
  
  return data.every(item => 
    item && 
    typeof item === 'object' && 
    'name' in item && 
    'value' in item &&
    typeof item.value === 'number' &&
    !isNaN(item.value)
  );
};

// Sort chart data by value
export const sortChartData = (data: any[], sortOrder: 'asc' | 'desc' = 'desc') => {
  return [...data].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.value - a.value;
    }
    return a.value - b.value;
  });
}; 