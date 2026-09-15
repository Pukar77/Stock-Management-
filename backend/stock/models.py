from django.db import models
from django.db.models import Sum
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class PotentialStock(models.Model):
    hsn_code = models.IntegerField()
    product_name = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.hsn_code} - {self.product_name}"


class StockIn(models.Model):
    product = models.ForeignKey(
        PotentialStock, on_delete=models.PROTECT, related_name='stock_in'
    )
    quantity = models.FloatField()
    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=5
    )
    total_quantity = models.FloatField(default=0)
    purchased_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.quantity}"


class StockOut(models.Model):
    product = models.ForeignKey(
        PotentialStock, on_delete=models.PROTECT, related_name="stock_out"
    )
    quantity = models.FloatField()
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
    total_in = models.FloatField(default=0)
    total_out = models.FloatField(default=0)
    current_stock = models.FloatField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.product_name} - {self.current_stock}"

    @classmethod
    def stock_for_product(cls, product):
        return cls.objects.get_or_create(product=product)[0]

    @classmethod
    def refresh_for_product(cls, product):
        total_stock = cls.stock_for_product(product)
        total_stock.total_in = (
            StockIn.objects.filter(product=product).aggregate(total=Sum('quantity'))['total'] or 0
        )
        total_stock.total_out = (
            StockOut.objects.filter(product=product).aggregate(total=Sum('quantity'))['total'] or 0
        )
        total_stock.current_stock = total_stock.total_in - total_stock.total_out
        total_stock.save(update_fields=['total_in', 'total_out', 'current_stock'])
        return total_stock


def recompute_stock_in_totals(product):
    running_total = 0
    for stock_in in StockIn.objects.filter(product=product).order_by('id'):
        running_total += stock_in.quantity
        StockIn.objects.filter(pk=stock_in.pk).update(total_quantity=running_total)
    TotalStock.refresh_for_product(product)


@receiver([post_save, post_delete], sender=StockIn)
def sync_stock_in_totals(sender, instance, **kwargs):
    recompute_stock_in_totals(instance.product)


@receiver([post_save, post_delete], sender=StockOut)
def sync_stock_out_totals(sender, instance, **kwargs):
    TotalStock.refresh_for_product(instance.product)