from django.urls import path
from .views import add_potential_stock

urlpatterns = [
    path('potential-stock/', add_potential_stock, name='add-potential-stock'),
]
