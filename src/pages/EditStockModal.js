import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const SUCURSALES = [
  { key: 'matriz', label: 'Matriz' },
  { key: 'sucursal1', label: 'Sucursal 1' },
  { key: 'sucursal2', label: 'Sucursal 2' },
];

const EditStockModal = ({ open, onClose, producto }) => {
  const [stock, setStock] = useState({ matriz: '', sucursal1: '', sucursal2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open && producto) {
      setError('');
      setSuccess('');
      setLoading(true);
      // Obtener stock actual de todas las sucursales
      axios.get(`http://localhost:5000/api/stock/${producto.id}`)
        .then(res => {
          const stockData = { matriz: '', sucursal1: '', sucursal2: '' };
          res.data.forEach(s => {
            stockData[s.sucursal] = s.stock;
          });
          setStock(stockData);
        })
        .catch(() => setError('Error al cargar stock'))
        .finally(() => setLoading(false));
    }
  }, [open, producto]);

  const handleChange = (sucursal, value) => {
    setStock(prev => ({ ...prev, [sucursal]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    // Validación: no permitir valores negativos
    for (const suc of SUCURSALES) {
      const value = parseInt(stock[suc.key]);
      if (value < 0) {
        setError('No se permite asignar stock negativo.');
        setLoading(false);
        return;
      }
    }
    try {
      for (const suc of SUCURSALES) {
        await axios.post('http://localhost:5000/api/stock/set', {
          producto_id: producto.id,
          sucursal: suc.key,
          stock: parseInt(stock[suc.key]) || 0
        });
      }
      setSuccess('Stock actualizado correctamente');
      if (onClose) setTimeout(onClose, 1000);
    } catch (e) {
      setError('Error al guardar stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Stock - {producto?.name}</DialogTitle>
      <DialogContent>
        {loading && <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {!loading && SUCURSALES.map(suc => (
          <TextField
            key={suc.key}
            label={suc.label}
            type="number"
            value={stock[suc.key]}
            onChange={e => handleChange(suc.key, e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ min: 0 }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStockModal; 
 