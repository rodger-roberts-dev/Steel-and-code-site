from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("courses/", views.courses, name="courses"),
    path("applied-physics/", views.applied_physics, name="applied_physics"),
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
]
