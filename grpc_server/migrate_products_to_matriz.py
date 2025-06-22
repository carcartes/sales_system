from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['sales_system']
products_col = db['products']
matriz_col = db['matriz']

migrated = 0
for prod in products_col.find():
    new_prod = {
        'id': prod.get('codigo'),
        'name': prod.get('nombre'),
        'price': prod.get('precio'),
        'stock': 0,  # Por defecto
        'branch_id': 'matriz',
        'is_matriz': True,
        'last_updated': datetime.utcnow(),
        'imagen': prod.get('imagen')
    }
    matriz_col.insert_one(new_prod)
    migrated += 1

print(f"Productos migrados: {migrated}") 