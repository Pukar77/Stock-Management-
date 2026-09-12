from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):


    class Meta:
        model = User

        fields = [
            'username',
            'password',
            'first_name',
            'last_name',
            'phone_number',
            'email',
            'phone_number'
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data['phone_number'],
            email=validated_data.get('email', ''),
        )

        return user

class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                "message":"This account is diabled"
                }
            )

        if not user:
            return serializers.ValidationError(
                {
                    "message":"Invalid Username or password"
                }
            )

        refresh = RefreshToken.for_user(user)

        return{
            'user':user,
            'refresh':str(refresh),
            'access':str(refresh.access_token)
        }


