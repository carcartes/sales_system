import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <StorefrontIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Ventas
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/inventory"
          >
            Inventario
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/sales"
          >
            Ventas
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 