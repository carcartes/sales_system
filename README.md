# Sistema de Ventas e Inventario

Proyecto de ventas e inventario con Flask, React, MongoDB y microservicio gRPC.

## 🚀 Instrucciones Rápidas (Windows, CMD)

### 1. Clona el repositorio
```sh
git clone https://github.com/carcartes/sales_system.git
cd sales_system
```

### 2. Crea y activa el entorno virtual de Python
```sh
python -m venv venv
venv\Scripts\activate
```

### 3. Instala las dependencias de Python
```sh
pip install -r requirements.txt
```

### 4. Instala las dependencias del frontend
```sh
cd src
npm install
cd ..
```

### 5. Asegúrate de que MongoDB esté corriendo
- Solo abre MongoDB (por defecto en `localhost:27017`).

### 6. (Opcional) Limpia la base de datos de productos
```sh
python init_db.py
```

### 7. Inicia el microservicio gRPC
```sh
cd grpc_server
python server.py
cd ..
```
*Déjalo abierto en una terminal.*

### 8. Inicia el backend Flask
```sh
python app.py
```
*En otra terminal.*

### 9. Inicia el frontend React
```sh
cd src
npm start
```
*En otra terminal.*

---

## Acceso

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:5000](http://localhost:5000)

---

## Notas

- El microservicio gRPC debe estar corriendo para poder agregar productos.
- MongoDB debe estar iniciado antes de todo.
- El sistema está listo para usar después de estos pasos. 