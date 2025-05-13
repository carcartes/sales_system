from flask import Response, stream_with_context
import json
import queue
import threading
import logging

# Configuración de logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Cola global para mensajes
message_queue = queue.Queue()

def notify_low_stock(branch_id, product_name):
    """Envía notificación de stock bajo mediante SSE"""
    try:
        message = {
            'type': 'low_stock',
            'branch_id': branch_id,
            'message': f'¡Stock bajo! El producto {product_name} en {get_branch_name(branch_id)} se ha agotado.'
        }
        message_queue.put(json.dumps(message))
        logger.info(f"SSE notification queued: {message}")
        return True
    except Exception as e:
        logger.error(f"Error sending SSE notification: {str(e)}")
        return False

def get_branch_name(branch_id):
    """Obtiene el nombre de la sucursal según su ID"""
    branches = {
        'matriz': 'Sucursal Matriz',
        'sucursal1': 'Sucursal 1',
        'sucursal2': 'Sucursal 2'
    }
    return branches.get(branch_id, branch_id)

def stream():
    """Genera el stream de eventos SSE"""
    def generate():
        logger.info("New SSE connection established")
        while True:
            try:
                # Esperar por un mensaje
                message = message_queue.get(timeout=30)
                logger.debug(f"Sending SSE message: {message}")
                yield f"data: {message}\n\n"
            except queue.Empty:
                # Mantener la conexión viva
                logger.debug("Sending keepalive")
                yield ": keepalive\n\n"
            except Exception as e:
                logger.error(f"Error in SSE stream: {str(e)}")
                break

    response = Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no'  # Deshabilitar buffering
        }
    )
    return response 