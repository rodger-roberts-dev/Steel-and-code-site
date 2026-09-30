from django.urls import path
from . import views

urlpatterns = [
    path("", views.python_lab, name="python_lab"),
    path("lesson-demo/", views.lesson_demo, name="lab_lesson_demo"),
]
