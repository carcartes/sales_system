from flask import Blueprint, jsonify, request
from services.product_service import ProductService

stock_blueprint = Blueprint('stock', __name__)

@stock_blueprint.route('/', methods=['GET'])
def get_stock():
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