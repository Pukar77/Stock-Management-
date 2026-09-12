from django.urls import path

from .views import SignUPViews, LoginView


urlpatterns = [
    path('signup/', SignUPViews.as_view(), name='signup'),
     path('login/', LoginView.as_view(), name='login'),
]


# {
#     "first_name":"Pukar",
#     "last_name":"Rimal",
#     "username":"Rimal77",
#     "password":"pukar@123",
#     "phone_number":"9866337295",
#     "email":"pukarrimal11@gmail.com"
# }