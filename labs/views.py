from django.shortcuts import render


def python_lab(request):
    return render(request, "labs/lab.html")
