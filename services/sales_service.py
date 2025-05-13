from transbank.webpay.webpay_plus.transaction import Transaction
from config.mongodb import ventas_collection
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
import uuid

# Cargar variables de entorno
load_dotenv()

logger = logging.getLogger(__name__)

class SalesService:
    def __init__(self):
        # Configurar Transbank usando credenciales de integración
        self.commerce_code = "597055555532"  # Código de comercio de prueba
        self.api_key = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"  # Key de prueba
        
        # Configurar Transbank para integración
        self.tx = Transaction()
        self.tx.commerce_code = self.commerce_code
        self.tx.api_key = self.api_key
        self.tx.integration_type = "TEST"
        logger.info(f"Transbank initialized with commerce code: {self.commerce_code} in TEST mode")

    def generate_order_id(self):
        """Genera un ID de orden que cumple con los requisitos de Transbank"""
        # Transbank requiere un máximo de 26 caracteres
        return str(uuid.uuid4())[:8]

    def create_transaction(self, amount, order_id, return_url):
        """Crea una transacción en Transbank"""
        try:
            logger.info(f"Creating transaction - Amount: {amount}, Order ID: {order_id}, Return URL: {return_url}")
            
            # Validar datos
            if not isinstance(amount, (int, float)) or amount <= 0:
                raise ValueError(f"Invalid amount: {amount}")
            if not order_id:
                raise ValueError("Order ID is required")
            if not return_url:
                raise ValueError("Return URL is required")
            
            # Asegurar que el monto sea entero
            amount = int(amount)
            
            # Crear transacción
            try:
                response = self.tx.create(
                    buy_order=order_id,
                    session_id=order_id,
                    amount=amount,
                    return_url=return_url
                )
                
                logger.info(f"Raw Transbank response: {response}")
                
                # La respuesta de Transbank es un diccionario
                if isinstance(response, dict):
                    transaction_data = {
                        'token': response.get('token'),
                        'url': response.get('url') + "?token_ws=" + response.get('token')
                    }
                else:
                    transaction_data = {
                        'token': response.token,
                        'url': response.url + "?token_ws=" + response.token
                    }
                
                if not transaction_data['token'] or not transaction_data['url']:
                    raise Exception("Respuesta inválida de Transbank: falta token o URL")
                
                logger.info(f"Transaction created successfully - Token: {transaction_data['token']}, URL: {transaction_data['url']}")
                return transaction_data
                
            except Exception as e:
                logger.error(f"Error in Transbank API call: {str(e)}")
                raise Exception(f"Error en la comunicación con Transbank: {str(e)}")
                
        except ValueError as e:
            logger.error(f"Validation error in create_transaction: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}")
            raise Exception(f"Error al crear transacción: {str(e)}")

    def confirm_transaction(self, token):
        """Confirma una transacción en Transbank"""
        try:
            if not token:
                raise ValueError("Token is required")
                
            logger.info(f"Confirming transaction with token: {token}")
            try:
                response = self.tx.commit(token)
                
                logger.info(f"Raw confirmation response: {response}")
                
                # Convertir la respuesta a un diccionario si es necesario
                if isinstance(response, dict):
                    response_data = response
                else:
                    response_data = response.__dict__
                
                logger.info(f"Transaction confirmed - Response: {response_data}")
                return response_data
                
            except Exception as e:
                logger.error(f"Error in Transbank API call during confirmation: {str(e)}")
                raise Exception(f"Error en la comunicación con Transbank durante la confirmación: {str(e)}")
                
        except ValueError as e:
            logger.error(f"Validation error in confirm_transaction: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error confirming transaction: {str(e)}")
            raise Exception(f"Error al confirmar transacción: {str(e)}")

    def register_sale(self, sale_data):
        """Registra la venta en MongoDB"""
        try:
            if not sale_data:
                raise ValueError("Sale data is required")
                
            # Validar datos mínimos requeridos
            required_fields = ['token', 'response', 'items', 'branch_id']
            for field in required_fields:
                if field not in sale_data:
                    raise ValueError(f"Missing required field: {field}")
                
            sale_record = {
                **sale_data,
                'timestamp': datetime.utcnow(),
                'status': 'completed'
            }
            
            try:
                result = ventas_collection.insert_one(sale_record)
                logger.info(f"Sale registered with ID: {result.inserted_id}")
                return str(result.inserted_id)
            except Exception as e:
                logger.error(f"MongoDB error while registering sale: {str(e)}")
                raise Exception(f"Error al guardar la venta en la base de datos: {str(e)}")
                
        except ValueError as e:
            logger.error(f"Validation error in register_sale: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error registering sale: {str(e)}")
            raise Exception(f"Error al registrar venta: {str(e)}") 