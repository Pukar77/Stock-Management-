from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PotentialStock, StockIn, StockOut, TotalStock
from .serializer import (
    PotentialStockSerializer,
    StockInSerializer,
    StockOutSerializer,
    TotalStockSerializer,
)


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    success_message = "Item created successfully"

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @staticmethod
    def _first_error_message(errors):
        for key in ('non_field_errors', 'detail', 'message'):
            value = errors.get(key)
            if value:
                return value[0] if isinstance(value, list) else value
        return None

    def _error_response(self, serializer):
        errors = serializer.errors
        return Response(
            {
                "message": self._first_error_message(errors) or "Validation failed",
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return self._error_response(serializer)
        try:
            self.perform_create(serializer)
        except APIException:
            raise
        except Exception:
            return Response(
                {"message": "Something went wrong on the server. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {"message": self.success_message, "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class PotentialStockViewSet(BaseModelViewSet):
    queryset = PotentialStock.objects.all()
    serializer_class = PotentialStockSerializer
    success_message = "Potential stock item added successfully"

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(product_name__icontains=search)
        return qs

    # ModelViewSet handles the full CRUD; destroy is overridden only to
    # return a friendly message instead of Django's default 204 No Content.
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {"message": "Cannot delete a product that already has stock records."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"message": "Potential stock item deleted successfully"},
            status=status.HTTP_200_OK,
        )


class StockInViewSet(BaseModelViewSet):
    queryset = StockIn.objects.select_related('product', 'product__total_stock').order_by('id')
    serializer_class = StockInSerializer
    success_message = "Stock in item added successfully"


class StockOutViewSet(BaseModelViewSet):
    queryset = StockOut.objects.select_related('product', 'product__total_stock').order_by('id')
    serializer_class = StockOutSerializer
    success_message = "Stock out item added successfully"


class TotalStockViewSet(BaseModelViewSet):
    http_method_names = ['get', 'head', 'options']
    queryset = TotalStock.objects.select_related('product').order_by('id')
    serializer_class = TotalStockSerializer