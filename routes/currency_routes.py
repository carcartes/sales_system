from flask import Blueprint, jsonify
from services.currency_service import currency_service
import logging

logger = logging.getLogger(__name__)
currency_blueprint = Blueprint('currency', __name__)

@currency_blueprint.route('/rate', methods=['GET'])
def get_exchange_rate():
    """Obtiene la tasa de cambio actual CLP/USD"""
    try:
        rate = currency_service.get_usd_rate()
        return jsonify({
            'rate': rate,
            'clp_per_usd': round(1/rate, 2) if rate else None
        })
    except Exception as e:
        logger.error(f"Error getting exchange rate: {str(e)}")
        return jsonify({
            'error': 'Error al obtener la tasa de cambio',
            'rate': 0.00125,  # Fallback rate
            'clp_per_usd': 800
        }), 500 