import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, TextField, Button, Box, Alert, CircularProgress, IconButton, InputLabel } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const AddProduct = ({ onAdded }) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setImageBase64(base64);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setImageBase64('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (!codigo || !nombre || !precio || !imagen) {
      setError('Completa todos los campos y selecciona una imagen.');
      return;
    }
    if (isNaN(precio) || Number(precio) <= 0) {
      setError('El precio debe ser un número positivo');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('codigo', codigo);
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('imagen', imagen);
    try {
      const response = await axios.post('http://localhost:5000/api/stock/product', {
        id: codigo,
        name: nombre,
        price: precio,
        imagen: imageBase64,
      });
      setMensaje(response.data.mensaje || response.data.message);
      setCodigo('');
      setNombre('');
      setPrecio('');
      setImagen(null);
      setPreview(null);
      setImageBase64('');
      if (onAdded) onAdded(response.data.mensaje || response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3} sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Agregar Nuevo Producto
        </Typography>
        {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Código"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Precio"
            type="number"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: 0 }}
          />
          <Box display="flex" alignItems="center" mt={2} mb={2}>
            <InputLabel htmlFor="imagen" sx={{ mr: 2 }}>Imagen</InputLabel>
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCamera />}
              sx={{ mr: 2 }}
            >
              Subir
              <input
                id="imagen"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {preview && (
              <Box ml={2}>
                <img src={preview} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }} />
              </Box>
            )}
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Agregar Producto'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProduct; 