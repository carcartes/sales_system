from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def get_database():
    mongo_uri = os.getenv('MONGO_URI')
    db_name = os.getenv('MONGO_DB_NAME')
    
    if not mongo_uri or not db_name:
        raise ValueError("MONGO_URI y MONGO_DB_NAME deben estar definidos en el archivo .env")
    
    client = MongoClient(mongo_uri)
    return client[db_name]

# Inicializar colecciones
db = get_database()
matriz_collection = db['matriz']
ventas_collection = db['ventas']
stock_collection = db['stock'] 