from rest_framework import serializers
from .models import PotentialStock, StockIn, StockOut


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
    product = serializers.SlugRelatedField(
        slug_field='hsn_code',
        queryset=PotentialStock.objects.all()
    )

    class Meta:
        model = StockIn
        fields = [
            'id',
            'product',
            'quantity',
            'purchase_price',
            'purchased_at',
        ]
        read_only_fields = [
            'id',
            'purchased_at',
        ]


class StockOutSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(
        slug_field='hsn_code',
        queryset=PotentialStock.objects.all()
    )

    class Meta:
        model = StockOut
        fields = [
            'id',
            'product',
            'quantity',
            'sales_price',
            'sold_at',
        ]
        read_only_fields = [
            'id',
            'sold_at',
        ]
