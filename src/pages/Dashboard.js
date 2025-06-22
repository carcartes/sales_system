import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Dashboard() {
  const [matrizStock, setMatrizStock] = useState([]);
  const [sucursal1Stock, setSucursal1Stock] = useState([]);
  const [sucursal2Stock, setSucursal2Stock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [saleMessage, setSaleMessage] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    // Al cargar el Dashboard, se lee el mensaje de venta (si existe) desde sessionStorage.
    const storedSaleMessage = sessionStorage.getItem('saleMessage');
    if (storedSaleMessage) {
      setSaleMessage(JSON.parse(storedSaleMessage));
      // Borrar el mensaje para que no se repita.
      sessionStorage.removeItem('saleMessage');
      // Indicar que necesitamos refrescar los datos
      setShouldRefresh(true);
    }
    fetchData();
  }, []);

  // Efecto adicional para refrescar los datos cuando hay una venta exitosa
  useEffect(() => {
    if (shouldRefresh) {
      fetchData();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/currency/rate');
      setExchangeRate(response.data.rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      setExchangeRate(0.00125); // Fallback rate
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchExchangeRate();
      const [matrizRes, sucursal1Res, sucursal2Res] = await Promise.all([
        axios.get('http://localhost:5000/api/branches/matriz/stock'),
        axios.get('http://localhost:5000/api/branches/sucursal1/stock'),
        axios.get('http://localhost:5000/api/branches/sucursal2/stock')
      ]);
      setMatrizStock(matrizRes.data);
      setSucursal1Stock(sucursal1Res.data);
      setSucursal2Stock(sucursal2Res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = (products) => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  };

  const formatCurrency = (amount, currency = 'CLP') => {
    if (currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount * (exchangeRate || 0.00125));
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { color: 'error', label: 'Stock Bajo' };
    if (stock <= 10) return { color: 'warning', label: 'Stock Medio' };
    return { color: 'success', label: 'Stock OK' };
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Calcular productos únicos por id (no duplicar por sucursal)
  const allProducts = [...matrizStock, ...sucursal1Stock, ...sucursal2Stock];
  const uniqueProductIds = new Set(allProducts.map(p => p.id));
  const totalProducts = uniqueProductIds.size;
  const totalValue = calculateTotalValue(matrizStock) + 
                    calculateTotalValue(sucursal1Stock) + 
                    calculateTotalValue(sucursal2Stock);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          Dashboard de Inventario
        </Typography>
        <Tooltip title="Actualizar datos">
          <IconButton onClick={fetchData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {saleMessage && (
        <Alert severity={saleMessage.type} sx={{ mb: 2 }}>
          {saleMessage.text}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Resumen General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <InventoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Total Productos</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {totalProducts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Productos en inventario
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <MoneyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Valor Total</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {formatCurrency(totalValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(totalValue, 'USD')} USD
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <StoreIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Sucursales</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Matriz + 2 Sucursales
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs para seleccionar sucursal */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<InventoryIcon />} 
            label="Matriz" 
            iconPosition="start"
          />
          <Tab 
            icon={<StoreIcon />} 
            label="Sucursal 1" 
            iconPosition="start"
          />
          <Tab 
            icon={<StoreIcon />} 
            label="Sucursal 2" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Contenido de la sucursal seleccionada */}
      <Paper elevation={3} sx={{ p: 2 }}>
        {selectedTab === 0 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1 }} />
                Inventario Matriz
              </Typography>
              <Chip 
                label={`${matrizStock.length} productos`}
                color="primary"
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {matrizStock.map((product) => (
                <Grid item xs={12} md={6} key={product.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {product.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              Stock:
                            </Typography>
                            <Chip
                              size="small"
                              label={product.stock}
                              color={getStockStatus(product.stock).color}
                            />
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" color="primary">
                            {formatCurrency(product.price)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(product.price, 'USD')} USD
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {selectedTab === 1 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <StoreIcon sx={{ mr: 1 }} />
                Inventario Sucursal 1
              </Typography>
              <Chip 
                label={`${sucursal1Stock.length} productos`}
                color="primary"
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {sucursal1Stock.map((product) => (
                <Grid item xs={12} md={6} key={product.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {product.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              Stock:
                            </Typography>
                            <Chip
                              size="small"
                              label={product.stock}
                              color={getStockStatus(product.stock).color}
                            />
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" color="primary">
                            {formatCurrency(product.price)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(product.price, 'USD')} USD
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {selectedTab === 2 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <StoreIcon sx={{ mr: 1 }} />
                Inventario Sucursal 2
              </Typography>
              <Chip 
                label={`${sucursal2Stock.length} productos`}
                color="primary"
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {sucursal2Stock.map((product) => (
                <Grid item xs={12} md={6} key={product.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {product.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                              Stock:
                            </Typography>
                            <Chip
                              size="small"
                              label={product.stock}
                              color={getStockStatus(product.stock).color}
                            />
                          </Box>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" color="primary">
                            {formatCurrency(product.price)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(product.price, 'USD')} USD
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard; 