from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .serializers import SignupSerializer, LoginSerializer

class SignUPViews(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response (
                {
                "message":"User created sucessfully",
                "user" :{
                    "id":user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone_number": user.phone_number,
                    "email": user.email,
                }
        
            },
            status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    "message":f"Something went wrong in validation, {serializer.errors}",
                    "status":status.HTTP_400_BAD_REQUEST
                }
                
            )


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data['user']

            return Response(
                {
                    "message": "Login successful",

                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "phone_number": user.phone_number,
                        "email": user.email,
                    },

                    "tokens": {
                        "access": serializer.validated_data['access'],
                        "refresh": serializer.validated_data['refresh'],
                    }
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )