import grpc
from concurrent import futures
import time
import sys
import os
from datetime import datetime
sys.path.append(os.path.join(os.path.dirname(__file__), "protos"))
import product_pb2
import product_pb2_grpc
from pymongo import MongoClient

class ProductService(product_pb2_grpc.ProductServiceServicer):
    def __init__(self):
        # Conexión a MongoDB (ajusta la URI según tu entorno)
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['sales_system']
        self.products = self.db['matriz']

    def AddProduct(self, request, context):
        # Guardar el producto en la colección 'matriz' con el formato correcto
        product = {
            'id': request.codigo,
            'name': request.nombre,
            'price': request.precio,
            'stock': 0,  # Por defecto
            'branch_id': 'matriz',  # Por defecto
            'is_matriz': True,
            'last_updated': datetime.utcnow(),
            'imagen': request.imagen
        }
        self.products.insert_one(product)
        return product_pb2.Response(message='Producto agregado correctamente', success=True)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    product_pb2_grpc.add_ProductServiceServicer_to_server(ProductService(), server)
    server.add_insecure_port('[::]:50051')
    print('Servidor gRPC corriendo en el puerto 50051...')
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve() 