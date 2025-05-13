import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import axios from 'axios';

function Dashboard() {
  const [matrizStock, setMatrizStock] = useState([]);
  const [sucursalStock, setSucursalStock] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matrizRes, sucursalRes] = await Promise.all([
          axios.get('http://localhost:5000/api/branches/matriz/stock'),
          axios.get('http://localhost:5000/api/branches/sucursal1/stock')
        ]);
        setMatrizStock(matrizRes.data);
        setSucursalStock(sucursalRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Resumen Matriz */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventario Matriz
            </Typography>
            <Grid container spacing={2}>
              {matrizStock.map((product) => (
                <Grid item xs={12} key={product.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{product.name}</Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Stock: {product.stock}</Typography>
                        <Typography>
                          Precio: ${(product.price / 800).toFixed(2)} USD
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Resumen Sucursal */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventario Sucursal 1
            </Typography>
            <Grid container spacing={2}>
              {sucursalStock.map((product) => (
                <Grid item xs={12} key={product.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{product.name}</Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Stock: {product.stock}</Typography>
                        <Typography>
                          Precio: ${(product.price / 800).toFixed(2)} USD
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 