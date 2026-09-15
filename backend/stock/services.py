from django.db import transaction

from .models import StockIn, StockOut, TotalStock


class InsufficientStockError(Exception):
    pass


class StockService:

    @staticmethod
    def create_stock_in(product, quantity, purchase_price):
        with transaction.atomic():
            stock_in = StockIn.objects.create(
                product=product,
                quantity=quantity,
                purchase_price=purchase_price,
            )
            stock_in.refresh_from_db()
            return stock_in

    @staticmethod
    def create_stock_out(product, quantity, sales_price):
        with transaction.atomic():
            total_stock, _ = (
                TotalStock.objects.select_for_update().get_or_create(product=product)
            )
            if total_stock.current_stock < quantity:
                raise InsufficientStockError(
                    f"Not enough stock. Available: {total_stock.current_stock}, Requested: {quantity}"
                )
            return StockOut.objects.create(
                product=product,
                quantity=quantity,
                sales_price=sales_price,
            )