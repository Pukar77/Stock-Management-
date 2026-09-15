from django.db import models

# Create your models here.

class PotentialStock(models.Model):
    hsn_code = models.IntegerField()
    product_name = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.hsn_code} - {self.product_name}"

class StockIn(models.Model):
    product = models.ForeignKey(
        PotentialStock, on_delete=models.PROTECT, related_name='stock_in'
    )
    quantity = models.CharField(max_length=20)
    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=5
    )
    total_quantity = models.IntegerField(default=0)
    purchased_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.quantity}"

class StockOut(models.Model):
    product = models.ForeignKey(
        PotentialStock, on_delete=models.PROTECT, related_name="stock_out"
    )
    quantity = models.CharField(max_length=20)
    sales_price = models.DecimalField(
        max_digits=10, 
        decimal_places=5
    )
    sold_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.quantity}"

class TotalStock(models.Model):
    product = models.OneToOneField(
        PotentialStock, on_delete=models.PROTECT, related_name="total_stock"
    )
    total_in = models.IntegerField(default=0)
    total_out = models.IntegerField(default=0)
    current_stock = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.current_stock}"

    







    