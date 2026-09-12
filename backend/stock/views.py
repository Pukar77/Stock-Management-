from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .serializer import PotentialStockSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def add_potential_stock(request):
    serializer = PotentialStockSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Potential stock item added successfully",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(
        {
            "message": "Validation failed",
            "errors": serializer.errors,
        },
        status=status.HTTP_400_BAD_REQUEST,
    )
