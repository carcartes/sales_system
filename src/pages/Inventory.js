import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [updateQuantity, setUpdateQuantity] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedBranch, setSelectedBranch] = useState('matriz');
  const [sortConfig, setSortConfig] = useState({
    field: null,
    order: 'asc'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, [selectedBranch, sortConfig]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const queryParams = new URLSearchParams();
      if (sortConfig.field) {
        queryParams.append('sort_by', sortConfig.field);
        queryParams.append('sort_order', sortConfig.order);
      }
      const response = await axios.get(
        `http://localhost:5000/api/branches/${selectedBranch}/stock?${queryParams}`
      );
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setMessage({ type: 'error', text: 'Error al cargar el inventario' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setUpdateQuantity({
      ...updateQuantity,
      [productId]: value
    });
  };

  const handleUpdateStock = async (productId) => {
    try {
      const quantity = parseInt(updateQuantity[productId]);
      if (isNaN(quantity)) {
        setMessage({ type: 'error', text: 'Por favor ingrese una cantidad válida' });
        return;
      }
      await axios.post(`http://localhost:5000/api/branches/${selectedBranch}/update-stock`, {
        product_id: productId,
        quantity: quantity
      });
      setMessage({ type: 'success', text: 'Stock actualizado correctamente' });
      fetchInventory();
      setUpdateQuantity({ ...updateQuantity, [productId]: '' });
    } catch (error) {
      console.error('Error updating stock:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el stock' });
    }
  };

  const handleSort = (field) => {
    setSortConfig(prevConfig => ({
      field,
      order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const getStockStatus = (stock) => {
    if (stock <= 5) return { color: 'error', label: 'Bajo' };
    if (stock <= 10) return { color: 'warning', label: 'Medio' };
    return { color: 'success', label: 'Alto' };
  };

  const handleRefresh = () => {
    fetchInventory();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Gestión de Inventario
        </Typography>
        <Tooltip title="Actualizar inventario">
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                label="Sucursal"
              >
                <MenuItem value="matriz">Matriz</MenuItem>
                <MenuItem value="sucursal1">Sucursal 1</MenuItem>
                <MenuItem value="sucursal2">Sucursal 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Inventario de {selectedBranch === 'matriz' ? 'Matriz' : selectedBranch === 'sucursal1' ? 'Sucursal 1' : 'Sucursal 2'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('price')}>
                    Precio
                    {renderSortIcon('price')}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('stock')}>
                    Stock
                    {renderSortIcon('stock')}
                  </Box>
                </TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Actualizar Stock</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Cargando inventario...
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Typography variant="body1" gutterBottom>
                        ${product.price.toLocaleString()} CLP
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${product.price_usd} USD
                      </Typography>
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStockStatus(product.stock).label}
                        color={getStockStatus(product.stock).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={updateQuantity[product.id] || ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        placeholder="Nueva cantidad"
                        sx={{ width: 110 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateStock(product.id)}
                        disabled={!updateQuantity[product.id]}
                        sx={{ minWidth: 110 }}
                      >
                        Actualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default Inventory; 