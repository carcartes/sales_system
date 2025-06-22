import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon } from '@mui/icons-material';

function StockNotifications() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Al montar, revisa si hay una notificación reciente en localStorage
    const stored = localStorage.getItem('stockNotification');
    if (stored) {
      const { notification, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < 15000) {
        setNotification(notification);
        setOpen(true);
      } else {
        localStorage.removeItem('stockNotification');
      }
    }

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
          // Persistir en localStorage con timestamp
          localStorage.setItem('stockNotification', JSON.stringify({ notification: data, timestamp: Date.now() }));
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
    localStorage.removeItem('stockNotification');
  };

  const getAlertProps = () => {
    if (!notification) return { severity: 'info', icon: null };

    switch (notification.stock_status) {
      case 'agotado':
        return {
          severity: 'error',
          icon: <ErrorIcon />,
          title: '¡Stock Agotado!'
        };
      case 'bajo':
        return {
          severity: 'warning',
          icon: <WarningIcon />,
          title: '¡Stock Bajo!'
        };
      default:
        return {
          severity: 'info',
          icon: null,
          title: 'Notificación de Stock'
        };
    }
  };

  const alertProps = getAlertProps();

  return (
    <Snackbar
      open={open}
      autoHideDuration={15000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={alertProps.severity}
        variant="filled"
        icon={alertProps.icon}
        sx={{ 
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '1rem'
          }
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {alertProps.title}
          </Typography>
          <Typography variant="body2">
            {notification?.message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default StockNotifications; 