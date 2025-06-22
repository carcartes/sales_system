from flask import Blueprint, jsonify, request
from services.product_service import ProductService
from services.stock_service import StockService
from models.product import Product
from datetime import datetime
import base64
import sys
import os

stock_blueprint = Blueprint('stock', __name__)
stock_service = StockService()

@stock_blueprint.route('/', methods=['GET'])
def get_all_stock():
    try:
        product_service = ProductService()
        stock = product_service.get_stock()
        return jsonify(stock), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stock_blueprint.route('/<product_id>', methods=['PUT'])
def update_stock(product_id):
    try:
        data = request.get_json()
        if not data or 'quantity' not in data:
            return jsonify({"error": "Se requiere la cantidad"}), 400
        
        product_service = ProductService()
        updated = product_service.update_stock(product_id, data['quantity'])
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@stock_blueprint.route('/set', methods=['POST'])
def set_stock():
    data = request.json
    producto_id = data.get('producto_id')
    sucursal = data.get('sucursal')
    cantidad = data.get('stock')
    if not producto_id or not sucursal or cantidad is None:
        return jsonify({'error': 'Faltan datos'}), 400
    stock_service.set_stock(producto_id, sucursal, cantidad)
    return jsonify({'message': 'Stock actualizado correctamente'})

@stock_blueprint.route('/<producto_id>', methods=['GET'])
def get_stock_producto(producto_id):
    stocks = stock_service.get_stock(producto_id)
    return jsonify(stocks)

@stock_blueprint.route('/sucursal/<sucursal>', methods=['GET'])
def get_stock_sucursal(sucursal):
    stocks = stock_service.get_stock_for_sucursal(sucursal)
    return jsonify(stocks)

@stock_blueprint.route('/product', methods=['POST'])
def add_product():
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../grpc_server/protos')))
    import grpc
    import product_pb2
    import product_pb2_grpc
    data = request.json
    required_fields = ['id', 'name', 'price', 'imagen']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Falta el campo {field}'}), 400
    try:
        from config.mongodb import matriz_collection
        # Validar que el id no exista
        if matriz_collection.find_one({'id': data['id']}):
            return jsonify({'error': 'Ya existe un producto con ese ID'}), 400
        # Validar que el precio sea un número
        try:
            price = float(data['price'])
        except (ValueError, TypeError):
            return jsonify({'error': 'El precio debe ser un número'}), 400
        # Decodificar imagen de base64 a bytes
        imagen_bytes = base64.b64decode(data['imagen']) if data['imagen'] else b''
        # Llamar al microservicio gRPC
        channel = grpc.insecure_channel('localhost:50051')
        stub = product_pb2_grpc.ProductServiceStub(channel)
        grpc_product = product_pb2.Product(
            codigo=data['id'],
            nombre=data['name'],
            precio=price,
            imagen=imagen_bytes
        )
        response = stub.AddProduct(grpc_product)
        if response.success:
            return jsonify({'message': response.message}), 201
        else:
            return jsonify({'error': response.message}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500 