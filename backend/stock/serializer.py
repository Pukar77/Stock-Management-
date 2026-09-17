from rest_framework import serializers

from .models import PotentialStock, StockIn, StockOut, TotalStock
from .services import InsufficientStockError, StockService


class PotentialStockSerializer(serializers.ModelSerializer):

    class Meta:
        model = PotentialStock
        fields = [
            'id',
            'hsn_code',
            'product_name',
        ]
        read_only_fields = ['id']


class StockInSerializer(serializers.ModelSerializer):
    hsn_code = serializers.IntegerField(write_only=True)
    product_name = serializers.CharField(write_only=True)
    hsn_code_display = serializers.SerializerMethodField()
    product_name_display = serializers.SerializerMethodField()
    quantity = serializers.FloatField(min_value=0)
    purchase_price = serializers.DecimalField(max_digits=10, decimal_places=5, min_value=0)

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
            'total_quantity',
            'purchased_at',
        ]

    def get_hsn_code_display(self, obj):
        return obj.product.hsn_code

    def get_product_name_display(self, obj):
        return obj.product.product_name

    def validate(self, data):
        user = self.context['request'].user
        product = PotentialStock.objects.filter(
            hsn_code=data.get('hsn_code'),
            product_name=data.get('product_name'),
            user=user,
        ).first()
        if not product:
            raise serializers.ValidationError(
                "No product found with this HSN code and product name."
            )
        data.pop('hsn_code', None)
        data.pop('product_name', None)
        data['product'] = product
        return data

    def create(self, validated_data):
        product = validated_data.pop('product')
        return StockService.create_stock_in(product=product, **validated_data)


class StockOutSerializer(serializers.ModelSerializer):
    hsn_code = serializers.IntegerField(write_only=True)
    product_name = serializers.CharField(write_only=True)
    hsn_code_display = serializers.SerializerMethodField()
    product_name_display = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    quantity = serializers.FloatField(min_value=0)
    sales_price = serializers.DecimalField(max_digits=10, decimal_places=5, min_value=0)

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
        total_stock = getattr(obj.product, 'total_stock', None)
        if total_stock is None:
            total_stock = TotalStock.stock_for_product(obj.product, user=obj.user)
        return total_stock.current_stock

    def validate(self, data):
        user = self.context['request'].user
        product = PotentialStock.objects.filter(
            hsn_code=data.get('hsn_code'),
            product_name=data.get('product_name'),
            user=user,
        ).first()
        if not product:
            raise serializers.ValidationError(
                "No product found with this HSN code and product name."
            )
        data.pop('hsn_code', None)
        data.pop('product_name', None)
        data['product'] = product
        return data

    def create(self, validated_data):
        product = validated_data.pop('product')
        try:
            return StockService.create_stock_out(product=product, **validated_data)
        except InsufficientStockError as exc:
            raise serializers.ValidationError({"message": str(exc)})


class TotalStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    hsn_code = serializers.IntegerField(source='product.hsn_code', read_only=True)

    class Meta:
        model = TotalStock
        fields = [
            'id',
            'product_name',
            'hsn_code',
            'total_in',
            'total_out',
            'current_stock',
            'updated_at',
        ]
        read_only_fields = fields