import { useState } from 'react';
import api from '../../lib/api';
import { Card, Button, Badge } from '../../components/ui/BaseComponents';
import { FileText, Download, Calendar, BarChart3, Users } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(null);
  const [reports, setReports] = useState([]);

  const handleGenerateReport = async (type, params = {}) => {
    setLoading(type);
    try {
      const response = await api.get(`/reports/${type}`, {
        params,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `laporan-${type}-${dateStr}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      alert('✅ Laporan berhasil diunduh');
      loadReports();
    } catch (error) {
      console.error('Generate report error:', error);
      alert('Gagal generate laporan: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(null);
    }
  };

  const loadReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleDownloadReport = (report) => {
    window.open(`/api${report.url}`, '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Laporan</h1>
        <p className="text-text-tertiary">Generate dan unduh laporan penjualan & kinerja staff</p>
      </div>

      {/* Generate Reports */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Report */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Harian</h3>
              <p className="text-xs text-text-tertiary">Laporan penjualan harian</p>
            </div>
          </div>
          <Button
            onClick={() => handleGenerateReport('daily')}
            isLoading={loading === 'daily'}
            className="w-full"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </Card>

        {/* Weekly Report */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Mingguan</h3>
              <p className="text-xs text-text-tertiary">Laporan penjualan mingguan</p>
            </div>
          </div>
          <Button
            onClick={() => handleGenerateReport('weekly')}
            isLoading={loading === 'weekly'}
            className="w-full"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </Card>

        {/* Monthly Report */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">Bulanan</h3>
              <p className="text-xs text-text-tertiary">Laporan lengkap bulanan</p>
            </div>
          </div>
          <Button
            onClick={() => handleGenerateReport('monthly')}
            isLoading={loading === 'monthly'}
            className="w-full"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </Card>

        {/* Staff Report */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-danger/10 rounded-lg">
              <Users className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h3 className="font-semibold">Kinerja Staff</h3>
              <p className="text-xs text-text-tertiary">Kinerja kitchen, driver, admin</p>
            </div>
          </div>
          <Button
            onClick={() => handleGenerateReport('staff', { period: 'weekly' })}
            isLoading={loading === 'staff'}
            className="w-full"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </Card>
      </div>

      {/* Report Info */}
      <Card className="p-4 bg-info/5">
        <h3 className="font-semibold mb-2">📊 Informasi Laporan</h3>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>• <strong>Harian:</strong> Penjualan hari ini, total order, revenue, produk terlaris</li>
          <li>• <strong>Mingguan:</strong> Rekap penjualan 7 hari terakhir</li>
          <li>• <strong>Bulanan:</strong> Laporan lengkap penjualan + kinerja staff</li>
          <li>• <strong>Kinerja Staff:</strong> Statistik kitchen, driver, dan admin</li>
        </ul>
      </Card>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Laporan Terakhir</h2>
          <div className="space-y-2">
            {reports.slice(0, 10).map((report, index) => (
              <Card
                key={index}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-secondary"
                onClick={() => handleDownloadReport(report)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{report.fileName}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(report.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-text-tertiary" />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
