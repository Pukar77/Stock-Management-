from rest_framework import serializers
from django.db.models import Sum, IntegerField
from django.db.models.functions import Cast
from .models import PotentialStock, StockIn, StockOut, TotalStock


class PotentialStockSerializer(serializers.ModelSerializer):

    class Meta:
        model = PotentialStock
        fields = [
            'id',
            'hsn_code',
            'product_name'
        ]
        read_only_fields = ['id']


class StockInSerializer(serializers.ModelSerializer):
    hsn_code = serializers.IntegerField(write_only=True)
    product_name = serializers.CharField(write_only=True)
    hsn_code_display = serializers.SerializerMethodField()
    product_name_display = serializers.SerializerMethodField()
    total_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = StockIn
        fields = [
            'id',
            'hsn_code',
            'product_name',
            'hsn_code_display',
            'product_name_display',
            'quantity',
            'purchase_price',
            'total_quantity',
            'purchased_at',
        ]
        read_only_fields = [
            'id',
            'purchased_at',
        ]

    def get_hsn_code_display(self, obj):
        return obj.product.hsn_code

    def get_product_name_display(self, obj):
        return obj.product.product_name

    def validate(self, data):
        hsn_code = data.get('hsn_code')
        product_name = data.get('product_name')
        if not PotentialStock.objects.filter(hsn_code=hsn_code, product_name=product_name).exists():
            raise serializers.ValidationError("No product found with this HSN code and product name.")
        return data

    def create(self, validated_data):
        hsn_code = validated_data.pop('hsn_code')
        product_name = validated_data.pop('product_name')
        product = PotentialStock.objects.get(hsn_code=hsn_code, product_name=product_name)
        new_quantity = int(validated_data['quantity'])

        last_stock = StockIn.objects.filter(product=product).order_by('-id').first()
        previous_total = last_stock.total_quantity if last_stock else 0
        total_quantity = previous_total + new_quantity

        total_in = StockIn.objects.filter(product=product).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0
        total_in += new_quantity

        total_out = StockOut.objects.filter(product=product).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0

        total_stock, _ = TotalStock.objects.get_or_create(product=product)
        total_stock.total_in = total_in
        total_stock.total_out = total_out
        total_stock.current_stock = total_in - total_out
        total_stock.save()

        return StockIn.objects.create(
            product=product,
            total_quantity=total_quantity,
            **validated_data
        )


class StockOutSerializer(serializers.ModelSerializer):
    hsn_code = serializers.IntegerField(write_only=True)
    product_name = serializers.CharField(write_only=True)
    hsn_code_display = serializers.SerializerMethodField()
    product_name_display = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = StockOut
        fields = [
            'id',
            'hsn_code',
            'product_name',
            'hsn_code_display',
            'product_name_display',
            'quantity',
            'sales_price',
            'current_stock',
            'sold_at',
        ]
        read_only_fields = [
            'id',
            'sold_at',
        ]

    def get_hsn_code_display(self, obj):
        return obj.product.hsn_code

    def get_product_name_display(self, obj):
        return obj.product.product_name

    def get_current_stock(self, obj):
        total_in = StockIn.objects.filter(product=obj.product).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0
        total_out = StockOut.objects.filter(product=obj.product).exclude(pk=obj.pk).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0
        return total_in - total_out

    def validate(self, data):
        hsn_code = data.get('hsn_code')
        product_name = data.get('product_name')
        if not PotentialStock.objects.filter(hsn_code=hsn_code, product_name=product_name).exists():
            raise serializers.ValidationError("No product found with this HSN code and product name.")
        return data

    def create(self, validated_data):
        hsn_code = validated_data.pop('hsn_code')
        product_name = validated_data.pop('product_name')
        product = PotentialStock.objects.get(hsn_code=hsn_code, product_name=product_name)
        sell_quantity = int(validated_data['quantity'])

        total_in = StockIn.objects.filter(product=product).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0
        total_out_before = StockOut.objects.filter(product=product).aggregate(
            total=Sum(Cast('quantity', IntegerField()))
        ).get('total') or 0

        available = total_in - total_out_before
        if available < sell_quantity:
            raise serializers.ValidationError(
                {"message": f"Not enough stock. Available: {available}, Requested: {sell_quantity}"}
            )

        total_out_after = total_out_before + sell_quantity

        total_stock, _ = TotalStock.objects.get_or_create(product=product)
        total_stock.total_in = total_in
        total_stock.total_out = total_out_after
        total_stock.current_stock = total_in - total_out_after
        total_stock.save()

        return StockOut.objects.create(
            product=product,
            **validated_data
        )


class TotalStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    hsn_code = serializers.IntegerField(source='product.hsn_code', read_only=True)

    class Meta:
        model = TotalStock
        fields = ['id', 'product_name', 'hsn_code', 'total_in', 'total_out', 'current_stock', 'updated_at']
        read_only_fields = ['id', 'total_in', 'total_out', 'current_stock', 'updated_at']
