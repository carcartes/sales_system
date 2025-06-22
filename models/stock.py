class Stock:
    def __init__(self, producto_id, sucursal, stock):
        self.producto_id = producto_id
        self.sucursal = sucursal
        self.stock = stock

    def to_dict(self):
        return {
            "producto_id": self.producto_id,
            "sucursal": self.sucursal,
            "stock": self.stock
        }

    @staticmethod
    def from_dict(data):
        return Stock(
            producto_id=data.get('producto_id'),
            sucursal=data.get('sucursal'),
            stock=data.get('stock', 0)
        ) 