from django.urls import path
from .views import PotentialStockViewSet, StockInViewSet, StockOutViewSet, TotalStockViewSet

urlpatterns = [
    path('potential-stock/', PotentialStockViewSet.as_view({'get': 'list', 'post': 'create'}), name='potential-stock-list'),
    path('potential-stock/<int:pk>/', PotentialStockViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='potential-stock-detail'),

    path('stock-in/', StockInViewSet.as_view({'get': 'list', 'post': 'create'}), name='stock-in-list'),
    path('stock-in/<int:pk>/', StockInViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='stock-in-detail'),

    path('stock-out/', StockOutViewSet.as_view({'get': 'list', 'post': 'create'}), name='stock-out-list'),
    path('stock-out/<int:pk>/', StockOutViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='stock-out-detail'),

    path('total-stock/', TotalStockViewSet.as_view({'get': 'list', 'post': 'create'}), name='total-stock-list'),
    path('total-stock/<int:pk>/', TotalStockViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='total-stock-detail'),
]
