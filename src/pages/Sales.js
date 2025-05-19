import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Sales() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [branch, setBranch] = useState('matriz');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [branch]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const response = await axios.get(`http://localhost:5000/api/branches/${branch}/stock`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Error al cargar los productos' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      setMessage({ type: 'error', text: 'Por favor seleccione un producto y cantidad válida' });
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    if (quantity > product.stock) {
      setMessage({ type: 'error', text: 'No hay suficiente stock disponible' });
      return;
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
      price_usd: product.price_usd,
      total: product.price * quantity
    };
    setCart([...cart, cartItem]);
    setSelectedProduct('');
    setQuantity(1);
    setMessage({ type: 'success', text: 'Producto agregado al carrito' });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Iniciando proceso de pago...' });
      const saleResponse = await axios.post('http://localhost:5000/api/sales/create', {
        branch_id: branch,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: calculateTotal()
      });
      if (saleResponse.data.url && saleResponse.data.token) {
        sessionStorage.setItem('pendingSale', JSON.stringify({
          cart,
          branch,
          token: saleResponse.data.token
        }));
        window.location.href = saleResponse.data.url;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al iniciar el proceso de pago. Por favor intente nuevamente.' 
      });
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotalUSD = () => {
    return cart.reduce((sum, item) => sum + (item.price_usd * item.quantity), 0);
  };

  const handleRemoveFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token_ws');
    if (token) {
      const confirmPayment = async () => {
        try {
          setLoading(true);
          setMessage({ type: 'info', text: 'Confirmando pago...' });
          const pendingSale = JSON.parse(sessionStorage.getItem('pendingSale'));
          if (!pendingSale) {
            throw new Error('No se encontró información de la venta');
          }

          // Confirmar la venta usando POST para enviar todos los datos necesarios
          const response = await axios.post('http://localhost:5000/api/sales/confirm', {
            token_ws: token,
            branch_id: pendingSale.branch,
            items: pendingSale.cart.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          });

          if (response.data.status === 'success') {
            // Guardar mensaje de éxito en sessionStorage
            sessionStorage.setItem('saleMessage', JSON.stringify({
              type: 'success',
              text: 'Compra realizada con éxito. Stock actualizado.'
            }));
            
            // Limpiar el carrito y la venta pendiente
            setCart([]);
            sessionStorage.removeItem('pendingSale');
            
            // Redirigir a la página principal
            window.location.replace('/');
            return; // Importante: detener la ejecución aquí
          } else {
            throw new Error('Pago no autorizado');
          }
        } catch (error) {
          console.error('Error confirming payment:', error);
          setMessage({ 
            type: 'error', 
            text: 'Error al confirmar el pago. Por favor contacte a soporte.' 
          });
        } finally {
          setLoading(false);
        }
      };
      confirmPayment();
    }
  }, []);

  const handleRefresh = () => {
    fetchProducts();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Realizar Venta
        </Typography>
        <Tooltip title="Actualizar productos">
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agregar Productos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Sucursal</InputLabel>
                  <Select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    label="Sucursal"
                  >
                    <MenuItem value="matriz">Matriz</MenuItem>
                    <MenuItem value="sucursal1">Sucursal 1</MenuItem>
                    <MenuItem value="sucursal2">Sucursal 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    label="Producto"
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - Stock: {product.stock} - Precio: ${product.price.toLocaleString()} CLP (${product.price_usd} USD)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleAddToCart}
                  sx={{ height: '100%' }}
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Venta
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.quantity}
                          color={item.quantity <= 5 ? 'error' : item.quantity <= 10 ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" gutterBottom>
                          ${item.total.toLocaleString()} CLP
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${item.price_usd * item.quantity} USD
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFromCart(index)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Total: ${calculateTotal().toLocaleString()} CLP
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  USD: ${calculateTotalUSD().toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Procesando...' : 'Pagar con Webpay'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Sales; 