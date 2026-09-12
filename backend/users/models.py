from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.


class User(AbstractUser):
    phone_number = models.CharField(
        max_length=10,
        unique=True
    )
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username



#Now our user table contains fileds like 
# Now your user table has the normal Django fields:

# id
# username
# password
# first_name
# last_name
# email
# is_staff
# is_active


# and new additional field named as phone_number which we just created