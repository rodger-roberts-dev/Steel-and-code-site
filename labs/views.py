from django.shortcuts import render


def python_lab(request):
    return render(request, "labs/lab.html")


def lesson_demo(request):
    example_code = 'for step in range(3):\n    print(f"Step {step + 1}: Steel & Code")\n'
    return render(request, "labs/lesson_demo.html", {"example_code": example_code})
