from pymongo import MongoClient
from flask_cors import CORS

# Conexión a MongoDB (ajusta la URI si es necesario)
client = MongoClient('mongodb://localhost:27017/')
db = client['sales_system']
products = db['products']

# Actualiza todos los productos que no tengan el campo 'imagen'
result = products.update_many(
    { 'imagen': { '$exists': False } },
    { '$set': { 'imagen': b'' } }
)

print(f"Productos actualizados: {result.modified_count}") 