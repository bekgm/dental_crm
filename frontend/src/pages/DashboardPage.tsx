/** Dashboard page with charts and analytics. */

import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  LocalHospital as DoctorIcon,
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

const PIE_COLORS = ['#1565C0', '#42A5F5', '#388E3C', '#D32F2F', '#F57C00'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
      <Typography variant="h4" mb={3}>
        Dashboard
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={data.total_patients}
            icon={PeopleIcon}
            color="#1565C0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Doctors"
            value={data.total_doctors}
            icon={DoctorIcon}
            color="#00897B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Appointments"
            value={data.total_appointments}
            icon={CalendarIcon}
            color="#F57C00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${data.total_revenue.toLocaleString()}`}
            icon={MoneyIcon}
            color="#388E3C"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Monthly Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#1565C0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Appointment Status
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        />
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
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upcoming Appointments</Typography>
              <Typography variant="h3" color="primary" fontWeight={700}>
                {data.upcoming_appointments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Invoices</Typography>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                {data.pending_invoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
