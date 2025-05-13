from flask import Blueprint, request, jsonify, url_for, current_app
from services.sales_service import SalesService
from services.product_service import ProductService
import logging

logger = logging.getLogger(__name__)
sales_blueprint = Blueprint('sales', __name__)
sales_service = SalesService()
product_service = ProductService()

@sales_blueprint.route('/create', methods=['POST'])
def create_sale():
    """Inicia el proceso de venta"""
    try:
        data = request.json
        logger.info(f"Creating sale with data: {data}")
        
        # Validar datos requeridos
        if not data:
            raise ValueError("No se recibieron datos de la venta")
        
        if 'branch_id' not in data:
            raise ValueError("Se requiere branch_id")
            
        if 'items' not in data or not data['items']:
            raise ValueError("Se requiere al menos un item")
            
        if 'total_amount' not in data:
            raise ValueError("Se requiere total_amount")
            
        try:
            total_amount = float(data['total_amount'])
            if total_amount <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            raise ValueError("total_amount debe ser un número positivo")
        
        # Generar orden única con el nuevo método
        order_id = sales_service.generate_order_id()
        logger.info(f"Generated order ID: {order_id}")
        
        # Crear transacción en Transbank
        return_url = request.host_url.rstrip('/') + url_for('sales.confirm_sale')
        logger.info(f"Return URL: {return_url}")
        
        try:
            transaction = sales_service.create_transaction(
                amount=total_amount,
                order_id=order_id,
                return_url=return_url
            )
            
            if not transaction or not isinstance(transaction, dict):
                raise Exception("Respuesta inválida de Transbank")
            
            if 'token' not in transaction or 'url' not in transaction:
                raise Exception("Respuesta de Transbank incompleta")
            
            response_data = {
                'token': transaction['token'],
                'url': transaction['url'],
                'order_id': order_id
            }
            logger.info(f"Sale creation successful: {response_data}")
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}")
            return jsonify({'error': str(e)}), 500
        
    except ValueError as e:
        logger.warning(f"Validation error in create_sale: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error creating sale: {str(e)}")
        return jsonify({'error': str(e)}), 500

@sales_blueprint.route('/confirm', methods=['GET', 'POST'])
def confirm_sale():
    """Confirma la venta después del pago"""
    try:
        # Obtener token_ws del query string (GET) o del body (POST)
        if request.method == 'GET':
            token = request.args.get('token_ws')
            logger.info(f"Confirming sale with GET parameters: {request.args}")
        else:
            data = request.json
            token = data.get('token_ws')
            logger.info(f"Confirming sale with POST data: {data}")
        
        if not token:
            raise ValueError("Se requiere token_ws")
            
        try:
            response = sales_service.confirm_transaction(token)
            
            if not response:
                raise Exception("No se recibió respuesta de Transbank")
            
            if isinstance(response, dict) and response.get('status') == 'AUTHORIZED':
                # Registrar venta
                sale_id = sales_service.register_sale({
                    'token': token,
                    'response': response,
                    'items': request.args.get('items', []) if request.method == 'GET' else data.get('items', []),
                    'branch_id': request.args.get('branch_id') if request.method == 'GET' else data.get('branch_id')
                })
                
                # Actualizar stock para cada item
                items = request.args.get('items', []) if request.method == 'GET' else data.get('items', [])
                branch_id = request.args.get('branch_id') if request.method == 'GET' else data.get('branch_id')
                
                for item in items:
                    product_service.update_stock_for_sale(
                        branch_id=branch_id,
                        product_id=item['id'],
                        quantity=item['quantity']
                    )
                
                logger.info(f"Sale confirmed and registered with ID: {sale_id}")
                return jsonify({
                    'status': 'success',
                    'sale_id': sale_id
                })
            else:
                logger.warning(f"Transaction not authorized: {response}")
                return jsonify({
                    'status': 'failed',
                    'message': 'Transacción no autorizada'
                }), 400
                
        except Exception as e:
            logger.error(f"Error confirming transaction: {str(e)}")
            return jsonify({'error': str(e)}), 500
            
    except ValueError as e:
        logger.warning(f"Validation error in confirm_sale: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error confirming sale: {str(e)}")
        return jsonify({'error': str(e)}), 500 