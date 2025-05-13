from flask import Blueprint
from services.sse_service import stream

sse_blueprint = Blueprint('sse', __name__)

@sse_blueprint.route('/stream')
def stream_events():
    """Endpoint para las notificaciones SSE"""
    return stream() 