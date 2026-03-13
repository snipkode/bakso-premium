const axios = require('axios');

async function testReports() {
  try {
    // Login as admin
    const authResponse = await axios.post('http://localhost:9000/api/auth/staff', {
      phone: '081234567890',
      password: 'admin123',
    });
    
    const token = authResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Admin logged in');
    
    // Test daily report
    console.log('\n📊 Generating Daily Report...');
    const dailyReport = await axios.get('http://localhost:9000/api/reports/daily', { headers });
    console.log('✅ Daily Report:', dailyReport.data.report.fileName);
    console.log('   Total Orders:', dailyReport.data.report.summary.totalOrders);
    console.log('   Total Revenue: Rp', dailyReport.data.report.summary.totalRevenue.toLocaleString('id-ID'));
    
    // Test weekly report
    console.log('\n📊 Generating Weekly Report...');
    const weeklyReport = await axios.get('http://localhost:9000/api/reports/weekly', { headers });
    console.log('✅ Weekly Report:', weeklyReport.data.report.fileName);
    console.log('   Total Orders:', weeklyReport.data.report.summary.totalOrders);
    console.log('   Total Revenue: Rp', weeklyReport.data.report.summary.totalRevenue.toLocaleString('id-ID'));
    
    // Test monthly report
    console.log('\n📊 Generating Monthly Report...');
    const monthlyReport = await axios.get('http://localhost:9000/api/reports/monthly', { headers });
    console.log('✅ Monthly Report:', monthlyReport.data.report.fileName);
    console.log('   Total Orders:', monthlyReport.data.report.summary.totalOrders);
    console.log('   Total Revenue: Rp', monthlyReport.data.report.summary.totalRevenue.toLocaleString('id-ID'));
    
    // Test staff report
    console.log('\n👥 Generating Staff Performance Report...');
    const staffReport = await axios.get('http://localhost:9000/api/reports/staff?period=weekly', { headers });
    console.log('✅ Staff Report:', staffReport.data.report.fileName);
    console.log('   Kitchen Staff:', staffReport.data.report.summary.kitchen.total);
    console.log('   Drivers:', staffReport.data.report.summary.driver.total);
    console.log('   Admins:', staffReport.data.report.summary.admin.total);
    
    // Test report list
    console.log('\n📁 Getting Report List...');
    const reportList = await axios.get('http://localhost:9000/api/reports', { headers });
    console.log('✅ Total Reports:', reportList.data.reports.length);
    reportList.data.reports.forEach(r => {
      console.log(`   - ${r.fileName}`);
    });
    
    console.log('\n✅ All report tests passed!');
    console.log('\n📄 Reports saved to: /uploads/reports/');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testReports();
