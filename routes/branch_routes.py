from flask import Blueprint, jsonify, request
from services.product_service import ProductService

branch_blueprint = Blueprint('branch', __name__)
product_service = ProductService()

@branch_blueprint.route('/', methods=['GET'])
def get_branches():
    """Obtiene la lista de todas las sucursales"""
    try:
        branches = [
            {
                "id": "matriz",
                "name": "Sucursal Matriz",
                "address": "Calle Principal 123"
            },
            {
                "id": "sucursal1",
                "name": "Sucursal 1",
                "address": "Avenida Central 456"
            },
            {
                "id": "sucursal2",
                "name": "Sucursal 2",
                "address": "Plaza Mayor 789"
            }
        ]
        return jsonify(branches)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_blueprint.route('/<branch_id>/stock', methods=['GET'])
def get_branch_stock(branch_id):
    """Obtiene el stock de una sucursal específica con filtros y ordenamiento"""
    try:
        # Obtener parámetros de ordenamiento
        sort_by = request.args.get('sort_by')  # 'price' o 'stock'
        sort_order = request.args.get('sort_order', 'asc')  # 'asc' o 'desc'

        stock = product_service.get_branch_stock(branch_id, sort_by, sort_order)
        return jsonify(stock)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@branch_blueprint.route('/<branch_id>/update-stock', methods=['POST'])
def update_branch_stock(branch_id):
    """Actualiza el stock de un producto en una sucursal"""
    try:
        data = request.json
        if not data or 'product_id' not in data or 'quantity' not in data:
            return jsonify({'error': 'Se requiere product_id y quantity'}), 400

        # Si la solicitud viene de la página de ventas, usar update_stock_for_sale
        is_sale = request.args.get('is_sale', 'false').lower() == 'true'
        
        if is_sale:
            success = product_service.update_stock_for_sale(branch_id, data['product_id'], data['quantity'])
        else:
            success = product_service.set_stock(branch_id, data['product_id'], data['quantity'])

        if success:
            return jsonify({'message': 'Stock actualizado correctamente'})
        else:
            return jsonify({'error': 'No se pudo actualizar el stock'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500 