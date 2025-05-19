import requests
from services.currency_service import currency_service

# Probar la API directamente
response = requests.get('https://v6.exchangerate-api.com/v6/64ac7fe39853cd4cfa13ab33/latest/CLP')
data = response.json()
print(f"Respuesta directa de la API:")
print(f"1 USD = {1/data['conversion_rates']['USD']:.2f} CLP")

# Probar el servicio de moneda
print("\nUsando el servicio de moneda:")
print(f"1 USD = {1/currency_service.get_usd_rate():.2f} CLP")

# Probar algunas conversiones
test_amounts = [1000, 10000, 100000]
print("\nConversiones de ejemplo:")
for amount in test_amounts:
    usd = currency_service.clp_to_usd(amount)
    print(f"{amount:,} CLP = ${usd:.2f} USD") 