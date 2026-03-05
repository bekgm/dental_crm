/** Dashboard page with charts and analytics. */

import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, useMediaQuery, useTheme } from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  LocalHospital as DoctorIcon,
  EventNote as UpcomingIcon,
  ReceiptLong as PendingIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import { dashboardApi } from '@/api/services';
import type { DashboardData } from '@/types';

const PIE_COLORS = ['#6C63FF', '#00D9A6', '#928DFF', '#FF5C5C', '#FFB547'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(() => {
        /* handled by interceptor */
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Loading message="Loading dashboard..." />;

  const pieData = [
    { name: 'Scheduled', value: data.appointment_stats.scheduled },
    { name: 'Confirmed', value: data.appointment_stats.confirmed },
    { name: 'Completed', value: data.appointment_stats.completed },
    { name: 'Cancelled', value: data.appointment_stats.cancelled },
    { name: 'No Show', value: data.appointment_stats.no_show },
  ].filter((d) => d.value > 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={0.5} sx={{ fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={{ xs: 2, sm: 3 }} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
        Overview of your dental practice
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }} mb={{ xs: 2, sm: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Patients" value={data.total_patients} icon={PeopleIcon} color="#6C63FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Doctors" value={data.total_doctors} icon={DoctorIcon} color="#00D9A6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Appointments" value={data.total_appointments} icon={CalendarIcon} color="#FFB547" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Revenue" value={`$${data.total_revenue.toLocaleString()}`} icon={MoneyIcon} color="#928DFF" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                Monthly Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={isPhone ? 220 : 320}>
                <BarChart data={data.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C63FF" />
                      <stop offset="100%" stopColor="#928DFF" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                Appointment Status
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={isPhone ? 220 : 280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                  No appointment data yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }} mt={{ xs: 0.5, sm: 1 }}>
        <Grid item xs={12} sm={6}>
          <StatCard title="Upcoming Appointments" value={data.upcoming_appointments} icon={UpcomingIcon} color="#00D9A6" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard title="Pending Invoices" value={data.pending_invoices} icon={PendingIcon} color="#FFB547" />
        </Grid>
      </Grid>
    </Box>
  );
}
