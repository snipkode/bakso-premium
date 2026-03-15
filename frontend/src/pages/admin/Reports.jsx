import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui/BaseComponents';
import {
  FileText, Download, Calendar, BarChart3, TrendingUp, DollarSign,
  ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight,
  Filter, RefreshCw, FileSpreadsheet, Clock, CheckCircle, Tag, Percent,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 -mx-4 mt-4 mb-6 px-4 pt-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-blue-100 text-sm">Track your business performance</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={loadStats}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 w-fit">
            <Filter className="w-5 h-5 text-blue-100" />
            <span className="text-sm font-semibold text-white">Period:</span>
            <div className="flex gap-2">
              {[
                { value: 'today', label: 'Today' },
                { value: 'week', label: '7 Days' },
                { value: 'month', label: '30 Days' },
                { value: 'year', label: 'Year' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    dateRange === range.value
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-blue-100 hover:bg-white/20'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                {stats.revenueTrend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stats.revenueTrend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stats.revenueTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stats.revenueTrend)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rp {(stats.revenue || 0).toLocaleString('id-ID')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                {stats.ordersTrend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stats.ordersTrend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stats.ordersTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stats.ordersTrend)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.totalOrders || 0).toLocaleString('id-ID')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Package className="w-6 h-6 text-white" />
                </div>
                {stats.productsTrend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stats.productsTrend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stats.productsTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stats.productsTrend)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Products Sold</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.productsSold || 0).toLocaleString('id-ID')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                {stats.customersTrend && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stats.customersTrend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stats.customersTrend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stats.customersTrend)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.newCustomers || 0).toLocaleString('id-ID')}
              </p>
            </motion.div>
          </div>
        )}

        {/* Voucher Analytics */}
        {stats && stats.voucherUsage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Voucher Analytics</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Voucher usage and discount statistics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Used</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.voucherUsage.totalUsed || 0}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">vouchers redeemed</p>
              </div>

              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Total Discount</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rp {(stats.voucherUsage.totalDiscount || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">given to customers</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Avg. Discount</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.voucherUsage.avgDiscount || 0}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">per transaction</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Reports Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Reports</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download reports in PDF or Excel format</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'daily', label: 'Daily Report', icon: Calendar, desc: 'Daily summary' },
              { type: 'weekly', label: 'Weekly Report', icon: BarChart3, desc: 'Weekly analytics' },
              { type: 'monthly', label: 'Monthly Report', icon: TrendingUp, desc: 'Monthly performance' },
              { type: 'staff', label: 'Staff Report', icon: Users, desc: 'Staff metrics' },
            ].map((report, idx) => (
              <motion.div
                key={report.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <report.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{report.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{report.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateReport(report.type, 'pdf')}
                    isLoading={loading === `${report.type}-pdf`}
                    className="flex-1 text-xs h-9"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateReport(report.type, 'xlsx')}
                    isLoading={loading === `${report.type}-xlsx`}
                    className="flex-1 text-xs h-9"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-1" />
                    Excel
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        {paginatedReports.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Reports</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Previously generated reports</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {paginatedReports.map((report, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{report.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(report.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                    className="flex-shrink-0 ml-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400 px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
