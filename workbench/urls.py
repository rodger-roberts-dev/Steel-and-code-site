from django.urls import path

from . import views

app_name = "workbench"

urlpatterns = [
    path("", views.workbench, name="index"),
    path("board/", views.board, name="board"),
    # Lesson-aware route. Future PF1 lessons add a registry entry and are
    # reachable at /workbench/<slug>/ with no template or view changes.
    path("<slug:slug>/", views.workbench, name="lesson"),
]
