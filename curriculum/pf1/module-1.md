# Steel & Code — Programming Fundamentals I

## Module 1 — Foundations

## Module Theme

**Tell the computer exactly what you want it to do.**

Module 1 introduces students to the programming process, basic Python syntax, variables, input and output, expressions, calculations, and simple computational models.

The goal is not to memorize syntax.

The goal is to understand how a real-world problem becomes a working Python program.

---

# Module Outcomes

By the end of Module 1, students should be able to:

- Explain the basic input → process → output model
- Create and use variables
- Work with strings, integers, and floating-point values
- Accept user input
- Display useful output
- Use arithmetic operators
- Build expressions
- Convert between common data types
- Translate a simple formula into Python
- Test a program with different values
- Build a simple real-world calculator
- Explain the relationship between code and a basic computational model

---

# Suggested Module Length

**2 weeks**

Estimated student effort:

**6–10 hours total**

Suggested structure:

- 8 core videos
- Guided labs
- Independent challenges
- Knowledge checks
- 1 module project

---

# Week 1 — How Programs Work

## Lesson 1 — Programming as Automation

### Purpose

Introduce programming as a way to automate instructions and solve problems.

### Student Outcomes

Students should be able to:

- Explain what a program is
- Describe programming as a sequence of instructions
- Identify inputs, processes, and outputs
- Recognize repetitive tasks that could be automated

### Video 1

**Programming Is Automation**

Suggested length:

**8–12 minutes**

Topics:

- What programming actually is
- Programming versus memorizing syntax
- Giving computers precise instructions
- Automation
- Problem solving
- Input → Process → Output

### Example

Scenario:

Calculate the total cost of several items.

Input:

- Item price
- Quantity

Process:

```text
total = price × quantity
```

Output:

- Total cost

### Guided Lab

**First Python Program**

Students run:

```python
print("Welcome to Steel & Code")
print("Programming is a tool for solving problems.")
```

Students then modify the output.

### Independent Challenge

Create a program that displays:

- Your name
- A job or career you are interested in
- One task you would like to automate

### Knowledge Check

Example questions:

1. What are the three basic stages of a program?
2. What is automation?
3. Why does a computer require precise instructions?
4. Which part of input → process → output performs calculations?

---

# Lesson 2 — Variables and Data

## Purpose

Introduce variables as named containers for information.

### Student Outcomes

Students should be able to:

- Create variables
- Assign values
- Identify basic Python data types
- Use meaningful variable names

### Video 2

**Variables Give Data a Name**

Suggested length:

**8–12 minutes**

Topics:

- Variables
- Assignment
- Strings
- Integers
- Floating-point numbers
- Naming conventions

### Example

```python
student_name = "Alex"
age = 21
temperature = 72.5

print(student_name)
print(age)
print(temperature)
```

### Guided Lab

Students create variables for:

- Name
- Age
- Favorite number
- Current temperature

Then print each value.

### Independent Challenge

Create variables representing a simple purchase:

```text
product
price
quantity
```

Display the values.

### Knowledge Check

Students identify:

- Valid variable names
- Strings
- Integers
- Floats
- Assignment statements

---

# Lesson 3 — Input and Output

## Purpose

Teach students how programs interact with users.

### Student Outcomes

Students should be able to:

- Use `input()`
- Store user input in variables
- Use `print()`
- Create meaningful output messages

### Video 3

**Making Programs Interactive**

Suggested length:

**8–12 minutes**

Topics:

- `input()`
- `print()`
- User interaction
- Storing input
- Output formatting basics

### Example

```python
name = input("Enter your name: ")

print("Welcome,", name)
```

### Guided Lab

**Personal Greeting Program**

Students ask for:

- Name
- Favorite hobby

Then display a personalized message.

### Independent Challenge

Create a program that asks for:

- City
- State
- Favorite food

Then print a complete sentence using the responses.

### Knowledge Check

Students predict output and identify where user input is stored.

---

# Lesson 4 — Guided Build

## Purpose

Combine variables, input, and output into one complete program.

### Video 4

**Build Your First Interactive Program**

Suggested length:

**10–15 minutes**

### Project

Build a simple meal cost calculator.

Inputs:

- Meal price
- Number of people

Initial version should collect the values and display them.

Do not calculate the final cost yet.

### Guided Build Example

```python
meal_price = input("Enter the meal price: ")
people = input("How many people are eating? ")

print("Meal price:", meal_price)
print("Number of people:", people)
```

### Instructor Focus

Explain:

- Program planning
- Choosing variable names
- Writing one step at a time
- Running the program frequently
- Checking output

---

# Week 1 Practice Set

Students complete short exercises using:

- Variables
- Strings
- Integers
- Floats
- Input
- Output

Possible exercises:

1. Create a profile program
2. Ask for two pieces of information
3. Store and display product information
4. Fix incorrect variable names
5. Predict program output

---

# Week 2 — Calculations and Expressions

# Lesson 5 — Operators and Expressions

## Purpose

Teach students how Python performs calculations.

### Student Outcomes

Students should be able to:

- Use arithmetic operators
- Build expressions
- Understand order of operations
- Store calculated results

### Video 5

**Let Python Do the Math**

Suggested length:

**8–12 minutes**

Topics:

- `+`
- `-`
- `*`
- `/`
- `%`
- `**`
- Parentheses
- Order of operations

### Example

```python
price = 25
quantity = 3

total = price * quantity

print(total)
```

### Guided Lab

**Purchase Calculator**

Students calculate:

```text
subtotal = price × quantity
```

### Independent Challenge

Calculate total pay:

```text
pay = hours × hourly_rate
```

### Knowledge Check

Students predict results of simple expressions.

---

# Lesson 6 — Type Conversion

## Purpose

Teach students why input values often need conversion before calculations.

### Student Outcomes

Students should be able to:

- Explain why `input()` returns text
- Use `int()`
- Use `float()`
- Convert user input before calculations

### Video 6

**Turning User Input Into Numbers**

Suggested length:

**8–12 minutes**

### Example

```python
price = float(input("Enter price: "))
quantity = int(input("Enter quantity: "))

total = price * quantity

print(total)
```

### Guided Lab

Fix a program that attempts to calculate using unconverted input.

### Independent Challenge

Ask for:

- Hours worked
- Hourly pay rate

Convert both values and calculate total pay.

### Knowledge Check

Students identify which conversion function should be used in different situations.

---

# Lesson 7 — Turning Formulas Into Code

## Purpose

Show students how mathematical relationships become programs.

### Student Outcomes

Students should be able to:

- Identify variables in a formula
- Translate a formula into Python
- Test the program
- Explain the relationship between the formula and the code

### Video 7

**From Formula to Python**

Suggested length:

**10–15 minutes**

### Modeling Process

1. Identify the problem
2. Identify the variables
3. Identify the relationship
4. Translate the relationship into Python
5. Test the result

### Example 1 — Distance

Formula:

```text
distance = speed × time
```

Python:

```python
speed = 60
time = 2

distance = speed * time

print(distance)
```

### Example 2 — Ohm's Law

Formula:

```text
I = V / R
```

Python:

```python
voltage = 12
resistance = 100

current = voltage / resistance

print(current)
```

### Guided Lab

Build an Ohm's Law calculator using user input.

```python
voltage = float(input("Enter voltage: "))
resistance = float(input("Enter resistance: "))

current = voltage / resistance

print("Current:", current, "amps")
```

### Independent Challenge

Translate one of the following formulas into Python:

```text
distance = speed × time
```

or

```text
area = length × width
```

### Knowledge Check

Students identify:

- Inputs
- Outputs
- Variables
- Formula
- Python expression

---

# Lesson 8 — Computational Modeling Introduction

## Purpose

Introduce the idea that code can represent and explore real-world systems.

### Video 8

**Your First Computational Model**

Suggested length:

**10–15 minutes**

### Core Idea

A computational model represents a real-world relationship using code.

Students should understand that a model can be used to:

- Calculate results
- Change inputs
- Compare scenarios
- Explore relationships

### Example

Ohm's Law:

```python
voltage = float(input("Voltage: "))
resistance = float(input("Resistance: "))

current = voltage / resistance

print("Current:", current)
```

Run the program multiple times using different values.

Discuss:

- What happens when voltage increases?
- What happens when resistance increases?
- Why does the result change?

### Key Transition

Students should begin seeing the progression:

```text
Formula
   ↓
Program
   ↓
Model
```

### Guided Lab

Run the same model with at least three different input combinations.

Students record:

| Voltage | Resistance | Current |
|---:|---:|---:|
| 12 | 100 | |
| 24 | 100 | |
| 12 | 200 | |

Then describe what they observe.

### Independent Challenge

Choose a simple formula and create a Python program that allows the user to change the inputs.

---

# Module 1 Guided Labs

Module 1 should include several short labs.

Recommended labs:

## Lab 1 — Hello, Steel & Code

Skills:

- `print()`
- Running code

## Lab 2 — Personal Profile

Skills:

- Variables
- Strings
- Numbers

## Lab 3 — Interactive Greeting

Skills:

- `input()`
- `print()`

## Lab 4 — Purchase Calculator

Skills:

- Variables
- Arithmetic

## Lab 5 — Pay Calculator

Skills:

- Input
- Type conversion
- Expressions

## Lab 6 — Unit Converter

Skills:

- Formula translation
- Calculations

## Lab 7 — Ohm's Law Calculator

Skills:

- Formula translation
- User input
- Computational modeling

---

# Module 1 Workbench Requirements

Each major lesson should include a:

**Try in Workbench**

button.

Workbench examples should allow students to:

- Run instructor examples
- Change values
- Break the code intentionally
- Fix errors
- Experiment with inputs
- Complete guided labs

Workbench examples should remain small and focused.

---

# Independent Challenges

Challenges should require students to apply the concept without copying the instructor example exactly.

Recommended challenge length:

**10–30 minutes**

Possible challenges:

- Convert miles to kilometers
- Calculate total purchase cost
- Calculate hourly pay
- Calculate rectangle area
- Calculate travel distance
- Calculate fuel usage
- Build a basic electrical calculator

---

# Module 1 Debugging Skills

Introduce debugging early.

Students should learn to:

- Read error messages
- Check spelling
- Check variable names
- Check quotation marks
- Check parentheses
- Check data types
- Run programs frequently
- Change one thing at a time

Students should understand:

**Errors are part of programming.**

The goal is not avoiding errors.

The goal is learning how to diagnose them.

---

# Module 1 Project

## Real-World Calculator

### Objective

Build a complete Python program that models a simple real-world calculation.

### Student Requirements

The program must:

1. Ask the user for at least two inputs
2. Convert input values when necessary
3. Store values in meaningful variables
4. Perform at least one calculation
5. Store the result
6. Display meaningful output
7. Run successfully with different input values

### Possible Project Topics

Students may choose from:

- Pay calculator
- Travel calculator
- Fuel calculator
- Tip calculator
- Budget calculator
- Unit converter
- Electrical calculator
- Geometry calculator
- Science calculator

Instructor-approved custom projects may also be allowed.

---

# Project Example — Electrical Calculator

Inputs:

```text
Voltage
Resistance
```

Formula:

```text
I = V / R
```

Output:

```text
Current
```

Python example:

```python
voltage = float(input("Enter voltage: "))
resistance = float(input("Enter resistance: "))

current = voltage / resistance

print("Current:", current, "amps")
```

Students should customize the program rather than simply submit the example unchanged.

---

# Module 1 Project Checklist

Students should verify:

- [ ] Program runs without errors
- [ ] Variables have meaningful names
- [ ] User input is collected
- [ ] Numeric input is converted correctly
- [ ] Program performs the required calculation
- [ ] Output clearly explains the result
- [ ] Program has been tested with multiple values
- [ ] Student can explain what the program does

---

# Module 1 Completion Criteria

A student completes Module 1 after completing:

- Required lesson videos
- Core guided labs
- Independent challenges
- Knowledge checks
- Module 1 project

---

# Module 1 Instructor Production Checklist

## Videos

- [ ] Video 1 — Programming Is Automation
- [ ] Video 2 — Variables Give Data a Name
- [ ] Video 3 — Making Programs Interactive
- [ ] Video 4 — Build Your First Interactive Program
- [ ] Video 5 — Let Python Do the Math
- [ ] Video 6 — Turning User Input Into Numbers
- [ ] Video 7 — From Formula to Python
- [ ] Video 8 — Your First Computational Model

## Course Content

- [ ] Lesson 1 page
- [ ] Lesson 2 page
- [ ] Lesson 3 page
- [ ] Lesson 4 page
- [ ] Lesson 5 page
- [ ] Lesson 6 page
- [ ] Lesson 7 page
- [ ] Lesson 8 page

## Labs

- [ ] Hello, Steel & Code
- [ ] Personal Profile
- [ ] Interactive Greeting
- [ ] Purchase Calculator
- [ ] Pay Calculator
- [ ] Unit Converter
- [ ] Ohm's Law Calculator

## Assessments

- [ ] Knowledge checks
- [ ] Independent challenges
- [ ] Module 1 project
- [ ] Project checklist

## Platform

- [ ] Workbench examples
- [ ] Try in Workbench buttons
- [ ] Student navigation
- [ ] Module completion tracking

---

# Module 1 Definition of Done

Module 1 Version 1.0 is complete when a new student can:

1. Open Module 1
2. Move through all eight lessons
3. Watch the videos
4. Run examples in the Workbench
5. Complete guided labs
6. Complete independent challenges
7. Build the Module 1 project
8. Understand how a simple real-world relationship becomes Python code

The student should finish Module 1 understanding this progression:

**Problem → Inputs → Process → Output → Program → Model**

---

# Module 1 Core Message

**Programming is not about memorizing commands.**

**Programming is about describing a process clearly enough that a computer can perform it.**
