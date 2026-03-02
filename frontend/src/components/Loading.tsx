/** Loading spinner overlay. */

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={300}
      gap={2}
    >
      <CircularProgress size={48} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
