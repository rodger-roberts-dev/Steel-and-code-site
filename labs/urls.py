from django.urls import path
from . import views

urlpatterns = [
    path("", views.python_lab, name="python_lab"),
]
