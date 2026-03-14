import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui/BaseComponents';
import {
  FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign,
  ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight,
  Filter, RefreshCw, Printer, FileSpreadsheet, FileType,
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

  const handleGenerateReport = async (type, format = 'pdf') => {
    setLoading(`${type}-${format}`);
    try {
      let response;
      switch (type) {
        case 'daily':
          response = await reportsAPI.generateDaily({ range: dateRange, format });
          break;
        case 'weekly':
          response = await reportsAPI.generateWeekly({ range: dateRange, format });
          break;
        case 'monthly':
          response = await reportsAPI.generateMonthly({ range: dateRange, format });
          break;
        case 'staff':
          response = await reportsAPI.generateStaff({ period: dateRange, format });
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Create blob and download
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `report-${type}-${dateStr}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      window.URL.revokeObjectURL(url);

      loadReports();
      alert(`✅ Report generated successfully!`);
    } catch (error) {
      console.error('Generate report error:', error);
      alert('❌ Failed to generate report: ' + (error.response?.data?.error || error.message));
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

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate and download business reports
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date Range:</span>
          <div className="flex gap-2">
            {[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'year', label: 'Last Year' },
            ].map((range) => (
              <Button
                key={range.value}
                variant={dateRange === range.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDateRange(range.value)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`Rp ${stats.revenue?.toLocaleString('id-ID') || 0}`}
            icon={DollarSign}
            color="from-green-500 to-emerald-500"
            trend={stats.revenueTrend}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders?.toLocaleString('id-ID') || 0}
            icon={ShoppingBag}
            color="from-blue-500 to-cyan-500"
            trend={stats.ordersTrend}
          />
          <StatCard
            title="Products Sold"
            value={stats.productsSold?.toLocaleString('id-ID') || 0}
            icon={Package}
            color="from-orange-500 to-amber-500"
            trend={stats.productsTrend}
          />
          <StatCard
            title="New Customers"
            value={stats.newCustomers?.toLocaleString('id-ID') || 0}
            icon={Users}
            color="from-purple-500 to-pink-500"
            trend={stats.customersTrend}
          />
        </div>
      )}

      {/* Generate Reports */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'daily', label: 'Daily Report', icon: Calendar },
            { type: 'weekly', label: 'Weekly Report', icon: BarChart3 },
            { type: 'monthly', label: 'Monthly Report', icon: TrendingUp },
            { type: 'staff', label: 'Staff Report', icon: Users },
          ].map((report) => (
            <div key={report.type} className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <report.icon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{report.label}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGenerateReport(report.type, 'pdf')}
                  isLoading={loading === `${report.type}-pdf`}
                  className="flex-1 text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGenerateReport(report.type, 'xlsx')}
                  isLoading={loading === `${report.type}-xlsx`}
                  className="flex-1 text-xs"
                >
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Reports */}
      {paginatedReports.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h2>
          </div>

          <div className="space-y-3">
            {paginatedReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <FileType className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{report.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadReport(report)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
