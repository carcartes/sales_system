# Sistema de Ventas con Flask

Sistema de ventas que integra múltiples sucursales y casa matriz, con gestión de stock, pagos con Transbank y notificaciones en tiempo real.

## Características

- Consulta de stock y precios desde API externa para sucursales
- Gestión de stock local para casa matriz con MongoDB
- Conversión de precios a USD en tiempo real
- Integración con Transbank para pagos
- Notificaciones en tiempo real con Server-Sent Events (SSE)
- Registro de ventas en MongoDB

## Requisitos

- Python 3.8+
- MongoDB
- Redis (para SSE)
- Cuenta en Transbank
- API Key para conversión de moneda

## Instalación

1. Clonar el repositorio
2. Crear un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Completar las variables con tus credenciales

## Uso

1. Iniciar Redis:
   ```bash
   redis-server
   ```

2. Iniciar MongoDB:
   ```bash
   mongod
   ```

3. Iniciar la aplicación:
   ```bash
   python app.py
   ```

## Endpoints API

### Sucursales
- GET `/api/branches/<branch_id>/stock` - Obtener stock de una sucursal

### Ventas
- POST `/api/sales/create` - Crear nueva venta
- POST `/api/sales/confirm` - Confirmar venta después del pago

### Notificaciones
- GET `/api/notifications/stream` - Stream SSE para notificaciones

## Estructura del Proyecto

```
sales_system/
├── app.py
├── config/
│   └── mongodb.py
├── models/
│   └── product.py
├── routes/
│   ├── branch_routes.py
│   ├── sales_routes.py
│   └── sse_routes.py
├── services/
│   ├── product_service.py
│   ├── sales_service.py
│   └── sse_service.py
└── requirements.txt
``` 