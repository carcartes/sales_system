from config.mongodb import matriz_collection
from models.product import Product
from datetime import datetime

# Productos de ejemplo para la matriz
sample_products = [
    {
        "id": "1",
        "name": "Laptop HP",
        "price": 799999,
        "stock": 10,
        "is_matriz": True,
        "last_updated": datetime.utcnow()
    },
    {
        "id": "2",
        "name": "Monitor Dell 24\"",
        "price": 199999,
        "stock": 15,
        "is_matriz": True,
        "last_updated": datetime.utcnow()
    },
    {
        "id": "3",
        "name": "Teclado Mecánico",
        "price": 49999,
        "stock": 20,
        "is_matriz": True,
        "last_updated": datetime.utcnow()
    }
]

# Productos de ejemplo para la sucursal1
branch_products = [
    {
        "id": "4",
        "name": "Mouse Gaming",
        "price": 29999,
        "stock": 8,
        "branch_id": "sucursal1",
        "is_matriz": False,
        "last_updated": datetime.utcnow()
    },
    {
        "id": "5",
        "name": "Webcam HD",
        "price": 39999,
        "stock": 12,
        "branch_id": "sucursal1",
        "is_matriz": False,
        "last_updated": datetime.utcnow()
    }
]

def init_db():
    # Limpiar colección existente
    matriz_collection.delete_many({})
    
    # Insertar productos de la matriz
    for product_data in sample_products:
        product = Product.from_dict(product_data)
        matriz_collection.insert_one(product.to_dict())
    
    # Insertar productos de la sucursal
    for product_data in branch_products:
        product = Product.from_dict(product_data)
        matriz_collection.insert_one(product.to_dict())
    
    print("Base de datos inicializada con productos de ejemplo")

if __name__ == "__main__":
    init_db() 