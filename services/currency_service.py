import requests
import os
from dotenv import load_dotenv

load_dotenv()

class CurrencyService:
    def __init__(self):
        self.api_key = "64ac7fe39853cd4cfa13ab33"
        self.base_url = "https://v6.exchangerate-api.com/v6/64ac7fe39853cd4cfa13ab33/latest/CLP"
        self._usd_rate = None

    def get_usd_rate(self):
        """Obtiene la tasa de conversión CLP a USD desde la API"""
        try:
            if self._usd_rate is None:
                response = requests.get(self.base_url)
                if response.status_code == 200:
                    data = response.json()
                    self._usd_rate = data['conversion_rates']['USD']
                    print(f"Tasa de cambio actualizada: 1 USD = {1/self._usd_rate:.2f} CLP")
                else:
                    print(f"Error en la API: {response.status_code}")
                    self._usd_rate = 0.00125  # fallback
            return self._usd_rate
        except Exception as e:
            print(f"Error getting USD rate: {str(e)}")
            # Fallback a una tasa fija si la API falla
            return 0.00125  # 1 USD = 800 CLP aproximadamente

    def clp_to_usd(self, amount_clp):
        """Convierte un monto de CLP a USD"""
        rate = self.get_usd_rate()
        return round(amount_clp * rate, 2)

# Instancia global del servicio
currency_service = CurrencyService() 