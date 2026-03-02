/** Reusable stat card for dashboard. */

import { Card, CardContent, Typography, Box, type SvgIconProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<SvgIconProps>;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}15`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 32, color }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
