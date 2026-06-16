'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as SalesIcon,
  ShoppingBag as OrderIcon,
  Group as CustomerIcon,
  AttachMoney as ProfitIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Link from 'next/link';
import axios from 'axios';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState({
    todaySales: 0,
    totalOrders: 0,
    netProfit: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);

        // ၁။ Backend 'api/sale' မှ အရောင်းဒေတာအားလုံးကို သိမ်းဆည်းထားသော Token ဖြင့် လှမ်းခေါ်ခြင်း
        const tokenData = localStorage.getItem('token');
        const headers = tokenData ? { Authorization: `Bearer ${tokenData}` } : {};

        const response = await axios.get('http://localhost:8080/api/sale', { headers });
        
        // Backend မှ ဒေတာတည်ဆောက်ပုံ (RepositoryBase အရ data array ထဲမှာ ရှိတတ်ပါသည်)
        const salesList = response.data?.data || response.data || [];

        // ၂။ ယနေ့ရက်စွဲနဲ့ ကိုက်ညီတဲ့ ဒေတာများကို စစ်ထုတ်ပြီး ပေါင်းလဒ်တွက်ချက်ခြင်း
        const todayStr = new Date().toDateString();
        let todayTotalAmount = 0;
        let todayOrderCount = 0;

        salesList.forEach(sale => {
          const saleDate = new Date(sale.date).toDateString();
          if (saleDate === todayStr) {
            todayTotalAmount += Number(sale.total_amount || 0);
            todayOrderCount += 1;
          }
        });

        // ၃။ ရရှိလာသော တန်ဖိုးများကို Dashboard Card များအတွက် သတ်မှတ်ခြင်း
        setSalesSummary({
          todaySales: todayTotalAmount,
          totalOrders: todayOrderCount,
          // အမြတ်ကို ဥပမာအားဖြင့် ဝင်ငွေရဲ့ ၃၅% ဟု သတ်မှတ်တွက်ချက်ထားပါတယ်
          netProfit: Math.round(todayTotalAmount * 0.35) 
        });

        // ၄။ လတ်တလော ရောင်းရသော အော်ဒါ ၅ ခုကို ဇယားတွင် ပြသရန် စီစဉ်ခြင်း
        const formattedOrders = salesList.slice(0, 5).map((sale, index) => ({
          id: sale.id ? `INV-${String(sale.id).padStart(4, '0')}` : `INV-00${index + 1}`,
          time: new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          items: `${sale.total_item || 0} Items Ordered`,
          total: `${Number(sale.total_amount || 0).toLocaleString()} MMK`,
          status: "Paid"
        }));
        setRecentOrders(formattedOrders);

        // ၅။ ရောင်းအားအကောင်းဆုံး ပစ္စည်းများအတွက် ဒေတာတည်ဆောက်ခြင်း (Mockup မှ Real-time သို့ ပြောင်းလဲခြင်း)
        // (Backend တွင် သီးသန့် top-selling မရှိသေးသဖြင့် အရောင်းစာရင်းမှ ပစ္စည်းအရေအတွက်ကို အခြေခံပြီး ပြသပေးထားပါသည်)
        let calculatedCount = 0;
        salesList.forEach(s => calculatedCount += Number(s.total_item || 0));
        
        if (todayTotalAmount > 0) {
          setTopItems([
            { name: "Total Items Sold Today", category: "Active Sales", salesCount: calculatedCount, revenue: `${todayTotalAmount.toLocaleString()} MMK` }
          ]);
        } else {
          setTopItems([]);
        }

      } catch (error) {
        console.error("Dashboard Loading Error:", error);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  // Summary Cards သို့ ဒေတာများ ချိတ်ဆက်ထည့်သွင်းခြင်း
  const summaryCards = [
    { title: "Today's Sales", value: `${salesSummary.todaySales.toLocaleString()} MMK`, icon: <SalesIcon fontSize="large" />, color: "#2e7d32", bgColor: "#e8f5e9" },
    { title: "Total Orders Today", value: `${salesSummary.totalOrders} Orders`, icon: <OrderIcon fontSize="large" />, color: "#1565c0", bgColor: "#e3f2fd" },
    { title: "New Users/Staff", value: "System Active", icon: <CustomerIcon fontSize="large" />, color: "#ed6c02", bgColor: "#fff3e5" },
    { title: "Est. Net Profit (35%)", value: `${salesSummary.netProfit.toLocaleString()} MMK`, icon: <ProfitIcon fontSize="large" />, color: "#9c27b0", bgColor: "#f3e5f5" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Welcome Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2035' }}>
            POS Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your shop today.
          </Typography>
        </Box>
        <Link href="/cashier" passHref style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" startIcon={<SalesIcon />} endIcon={<ArrowForwardIcon />}>
            Go to Cashier
          </Button>
        </Link>
      </Box>

      {/* Summary Cards Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {summaryCards.map((card, index) => (
          <Box key={index}>
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: card.bgColor, 
                    color: card.color, 
                    width: 56, 
                    height: 56, 
                    mr: 2,
                    borderRadius: 2
                  }}
                >
                  {card.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '500' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5, color: '#1a2035' }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Tables Section */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, 
        gap: 3 
      }}>
        
        {/* Recent Sales Table */}
        <Box>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a2035' }}>
              Recent Orders Today
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f4f6f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Invoice ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Items Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No orders recorded today yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((sale, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: '500' }}>{sale.id}</TableCell>
                        <TableCell color="text.secondary">{sale.time}</TableCell>
                        <TableCell>{sale.items}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{sale.total}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ 
                            bgcolor: '#e8f5e9', 
                            color: '#2e7d32', 
                            borderRadius: '12px', 
                            py: 0.5, 
                            fontSize: '12px', 
                            fontWeight: 'bold' 
                          }}>
                            {sale.status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* Top Items Table */}
        <Box>
          <Card elevation={2} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a2035' }}>
              Today's Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ bgcolor: '#f4f6f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Total Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topItems.map((item, i) => (
                      <TableRow key={i} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>{item.salesCount}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1565c0' }}>{item.revenue}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

      </Box>
    </Box>
  );
}

