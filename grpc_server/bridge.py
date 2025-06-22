import os
import sys
from flask import Flask, request, jsonify
import grpc
from flask_cors import CORS
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "protos")))
import product_pb2
import product_pb2_grpc

app = Flask(__name__)
CORS(app)

@app.route('/api/product', methods=['POST'])
def receive_form():
    codigo = request.form['codigo']
    nombre = request.form['nombre']
    precio = float(request.form['precio'])
    imagen = request.files['imagen'].read()

    # Conectar al servidor gRPC
    channel = grpc.insecure_channel('localhost:50051')
    stub = product_pb2_grpc.ProductServiceStub(channel)

    product = product_pb2.Product(
        codigo=codigo,
        nombre=nombre,
        precio=precio,
        imagen=imagen
    )
    response = stub.AddProduct(product)
    return jsonify({'mensaje': response.message, 'success': response.success})

if __name__ == '__main__':
    app.run(debug=True, port=8000) 