from config.mongodb import matriz_collection

def init_db():
    # Limpiar colección existente
    matriz_collection.delete_many({})
    print("Base de datos de productos vaciada.")

if __name__ == "__main__":
    init_db() 