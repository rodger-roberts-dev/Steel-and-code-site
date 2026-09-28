from django.shortcuts import render

def home(request):
    return render(request, "website/home.html")


def courses(request):
    return render(request, "website/courses.html")


def applied_physics(request):
    return render(request, "website/applied_physics.html")


def about(request):
    return render(request, "website/about.html")


def contact(request):
    return render(request, "website/contact.html")
