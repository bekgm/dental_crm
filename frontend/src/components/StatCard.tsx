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
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `${color}10`,
          transform: 'translate(30px, -40px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, fontSize: { xs: '1.3rem', sm: '1.75rem' } }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              borderRadius: 3,
              p: { xs: 0.8, sm: 1.2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 14px ${color}40`,
            }}
          >
            <Icon sx={{ fontSize: { xs: 22, sm: 28 }, color: 'white' }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
