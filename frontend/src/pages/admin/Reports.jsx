import { useState, useEffect } from 'react';
import { reportsAPI } from '../../lib/api';
import { Card, Button, Badge, Pagination } from '../../components/ui/BaseComponents';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadStats();
    loadReports();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      const response = await reportsAPI.getStats(dateRange);
      setStats(response.data.stats || response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getReportList();
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleGenerateReport = async (type, params = {}) => {
    setLoading(type);
    try {
      let response;
      switch (type) {
        case 'daily':
          response = await reportsAPI.generateDaily({ range: dateRange });
          break;
        case 'weekly':
          response = await reportsAPI.generateWeekly({ range: dateRange });
          break;
        case 'monthly':
          response = await reportsAPI.generateMonthly({ range: dateRange });
          break;
        case 'staff':
          response = await reportsAPI.generateStaff({ period: dateRange });
          break;
        default:
          throw new Error('Invalid report type');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `report-${type}-${dateStr}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      loadReports();
    } catch (error) {
      console.error('Generate report error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadReport = (report) => {
    window.open(`/api${report.url}`, '_blank');
  };

  const reportsPerPage = 5;
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const paginatedReports = reports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  return (
    <div className="space-y-3 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Generate and download business reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-8 pr-7 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { loadStats(); loadReports(); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Card className="p-3 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            {stats?.revenue && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats ? formatRupiah(stats.revenue || 0, { compact: true }) : '-'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Revenue</p>
        </Card>

        <Card className="p-3 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            {stats?.orders && (
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                <ArrowUpRight className="w-3 h-3" />
                8%
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.orders?.toLocaleString('id-ID') || '-'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Orders</p>
        </Card>

        <Card className="p-3 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            {stats?.productsSold && (
              <div className="flex items-center gap-1 text-xs font-medium text-purple-600">
                <ArrowUpRight className="w-3 h-3" />
                15%
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.productsSold?.toLocaleString('id-ID') || '-'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Products Sold</p>
        </Card>

        <Card className="p-3 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            {stats?.newCustomers && (
              <div className="flex items-center gap-1 text-xs font-medium text-orange-600">
                <ArrowUpRight className="w-3 h-3" />
                20%
              </div>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.newCustomers?.toLocaleString('id-ID') || '-'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">New Customers</p>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Average Order Value */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Avg Order Value</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue per order</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats ? formatRupiah((stats?.revenue || 0) / (stats?.orders || 1), { compact: true }) : '-'}
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-xs">
            <span className="text-green-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              5.2%
            </span>
            <span className="text-gray-500 dark:text-gray-400">vs last period</span>
          </div>
        </Card>

        {/* Completion Rate */}
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Completion Rate</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Successful orders</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats?.completionRate || 95}%
          </p>
          <div className="mt-1.5">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full"
                style={{ width: `${stats?.completionRate || 95}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Generate Reports */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Generate Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Daily Report */}
          <Card className="p-3 border-l-4 border-l-blue-500 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Daily</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Today's sales</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              Complete sales report for today including revenue and top products
            </p>
            <Button
              onClick={() => handleGenerateReport('daily')}
              isLoading={loading === 'daily'}
              className="w-full h-8 text-xs"
              size="sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Generate
            </Button>
          </Card>

          {/* Weekly Report */}
          <Card className="p-3 border-l-4 border-l-green-500 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Weekly</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">7 days trend</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              Sales recap for last 7 days with trend analysis
            </p>
            <Button
              onClick={() => handleGenerateReport('weekly')}
              isLoading={loading === 'weekly'}
              className="w-full h-8 text-xs"
              size="sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Generate
            </Button>
          </Card>

          {/* Monthly Report */}
          <Card className="p-3 border-l-4 border-l-purple-500 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Monthly</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full report</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              Comprehensive monthly sales report with staff performance
            </p>
            <Button
              onClick={() => handleGenerateReport('monthly')}
              isLoading={loading === 'monthly'}
              className="w-full h-8 text-xs"
              size="sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Generate
            </Button>
          </Card>

          {/* Staff Report */}
          <Card className="p-3 border-l-4 border-l-orange-500 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs">Staff</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              Kitchen, driver, and admin performance metrics
            </p>
            <Button
              onClick={() => handleGenerateReport('staff', { period: dateRange })}
              isLoading={loading === 'staff'}
              className="w-full h-8 text-xs"
              size="sm"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Generate
            </Button>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Reports</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Report
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      Generated
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedReports.map((report, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                              {report.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(report.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            report.type === 'daily' ? 'primary' :
                            report.type === 'weekly' ? 'success' :
                            report.type === 'monthly' ? 'warning' : 'secondary'
                          }
                          className="text-xs px-2 py-0.5"
                        >
                          {report.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {new Date(report.createdAt).toLocaleString('id-ID', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReport(report);
                          }}
                          className="p-1.5 h-auto"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {reports.length} reports
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
              📊 Report Tips
            </h3>
            <ul className="space-y-0.5 text-xs text-blue-800 dark:text-blue-200">
              <li>• <strong>Daily:</strong> Best for daily review and cash flow</li>
              <li>• <strong>Weekly:</strong> Identify trends and patterns</li>
              <li>• <strong>Monthly:</strong> Complete business analysis</li>
              <li>• <strong>Staff:</strong> Team performance evaluation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function for currency formatting
function formatRupiah(amount, options = {}) {
  const { compact = false } = options;
  
  if (compact) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
