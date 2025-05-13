import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

function StockNotifications() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log('Iniciando conexión SSE...');
    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream');

    eventSource.onopen = () => {
      console.log('Conexión SSE establecida');
    };

    eventSource.onmessage = (event) => {
      try {
        if (event.data === ': keepalive') {
          console.log('Keepalive recibido');
          return;
        }
        
        const data = JSON.parse(event.data);
        console.log('Notificación recibida:', data);
        
        if (data.type === 'low_stock') {
          setNotification(data);
          setOpen(true);
        }
      } catch (error) {
        console.error('Error al procesar notificación:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error en conexión SSE:', error);
      // Intentar reconectar después de un error
      setTimeout(() => {
        console.log('Intentando reconectar...');
        eventSource.close();
      }, 5000);
    };

    return () => {
      console.log('Cerrando conexión SSE');
      eventSource.close();
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity="warning" 
        variant="filled"
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '1rem'
          }
        }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
}

export default StockNotifications; 