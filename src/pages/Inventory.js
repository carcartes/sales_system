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
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
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

  useEffect(() => {
    fetchInventory();
  }, [selectedBranch, sortConfig]);

  const fetchInventory = async () => {
    try {
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
    return sortConfig.order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
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
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
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
              <TableCell>Actualizar Stock</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Typography variant="body1" gutterBottom>
                    ${product.price.toLocaleString()} CLP
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ${product.price_usd} USD
                  </Typography>
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={updateQuantity[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    placeholder="Nueva cantidad"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateStock(product.id)}
                    disabled={!updateQuantity[product.id]}
                  >
                    Actualizar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Inventory; 