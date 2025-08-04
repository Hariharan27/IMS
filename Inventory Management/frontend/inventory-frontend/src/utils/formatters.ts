// Format currency values
export const formatCurrency = (value: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

// Format numbers with commas
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Format percentage
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format timestamp
export const formatTimestamp = (timestamp: string | Date): string => {
  const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Format change percentage
export const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

// Get change color
export const getChangeColor = (change: number): string => {
  if (change > 0) return 'success.main';
  if (change < 0) return 'error.main';
  return 'text.secondary';
};

// Get severity color
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'error.main';
    case 'high':
      return 'warning.main';
    case 'medium':
      return 'info.main';
    case 'low':
      return 'success.main';
    default:
      return 'text.secondary';
  }
};

// Get activity icon
export const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'stock_movement':
      return 'inventory';
    case 'new_product':
      return 'add_box';
    case 'order_created':
      return 'shopping_cart';
    case 'alert':
      return 'warning';
    case 'user_action':
      return 'person';
    default:
      return 'info';
  }
};

// Get alert icon
export const getAlertIcon = (type: string): string => {
  switch (type) {
    case 'low_stock':
      return 'inventory_2';
    case 'order_pending':
      return 'pending_actions';
    case 'system':
      return 'system_update';
    case 'security':
      return 'security';
    default:
      return 'notifications';
  }
};

// Format chart tooltip
export const formatChartTooltip = (value: any, name: string) => {
  if (typeof value === 'number') {
    if (name.includes('Percentage') || name.includes('Accuracy') || name.includes('Fulfillment')) {
      return [`${value.toFixed(1)}%`, name];
    }
    if (name.includes('Value') || name.includes('Cost')) {
      return [`₹${value.toLocaleString()}`, name];
    }
    return [value.toLocaleString(), name];
  }
  return [value, name];
}; 