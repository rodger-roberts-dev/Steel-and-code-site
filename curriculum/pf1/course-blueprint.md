# Steel & Code — Programming Fundamentals I

## Self-Paced Course Blueprint

## Course Title

**Programming Fundamentals I: Python, Automation & Computational Modeling**

## Course Promise

Learn programming by solving problems, automating tasks, and building computational models with Python.

The goal is not to memorize Python syntax. By the end of the course, students should be able to:

- Analyze a problem
- Break it into logical steps
- Translate those steps into Python
- Test and debug their solution
- Automate repetitive tasks
- Build simple computational models
- Interpret and explain program results

---

# Course Structure

| Element | Target |
|---|---|
| Suggested Length | 8 weeks |
| Delivery | Fully self-paced |
| Weekly Effort | 3–5 hours |
| Videos Per Week | Approximately 4 |
| Video Length | 8–15 minutes |
| Total Videos | Approximately 32 |
| Major Modules | 4 |
| Module Projects | 4 |
| Final Project | 1 computational modeling capstone |
| Programming Language | Python |
| Coding Environment | Steel & Code Workbench |
| Prior Experience | None required |

---

# Learning Model

Every lesson should follow the same basic Steel & Code learning pattern:

## Learn

Watch a short explanation of the concept.

## Watch

Follow a worked example while the instructor explains the reasoning process.

## Build

Open the Steel & Code Workbench and build the example.

## Practice

Complete a similar problem independently.

## Apply

Use the concept to solve a real-world problem.

### Steel & Code Learning Pattern

**Learn → Watch → Build → Practice → Apply**

---

# Module 1 — Foundations

## Weeks 1–2

### Theme

**Tell the computer exactly what you want it to do.**

Students learn the basic programming process before introducing more complex logic.

---

## Week 1 — How Programs Work

### Video 1 — Programming as Automation

Topics:

- What programming actually is
- Programs as instructions
- Input → Process → Output
- Programming versus syntax
- Using Python to automate tasks

### Video 2 — Variables and Data

Topics:

- Variables
- Strings
- Integers
- Floating-point numbers
- Assignment

### Video 3 — Input and Output

Topics:

- `print()`
- `input()`
- Capturing user input
- Displaying meaningful output

### Video 4 — Guided Build

Build a simple interactive Python program using:

- Variables
- Input
- Output
- Basic calculations

---

## Week 2 — Calculations and Expressions

### Video 1 — Operators and Expressions

Topics:

- Addition
- Subtraction
- Multiplication
- Division
- Order of operations

### Video 2 — Type Conversion

Topics:

- `int()`
- `float()`
- `str()`
- Converting user input

### Video 3 — Turning Formulas Into Code

Topics:

- Identifying variables
- Translating formulas
- Building calculations
- Checking results

### Video 4 — Computational Example

Introduce a simple real-world computational model.

Example:

### Ohm's Law

```python
voltage = 12
resistance = 100

current = voltage / resistance

print(current)
```

Formula:

```text
I = V / R
```

Purpose:

Show students that Python can model real-world relationships.

---

# Module 1 Guided Labs

Possible labs:

- Tip calculator
- Pay calculator
- Temperature converter
- Distance converter
- Fuel mileage calculator
- Unit conversion
- Ohm's Law calculator
- Simple physics calculations

---

# Module 1 Project

## Build a Real-World Calculator

Students create a Python program that:

1. Accepts user input
2. Stores values in variables
3. Performs calculations
4. Displays meaningful results
5. Models a real-world scenario

Examples:

- Budget calculator
- Travel calculator
- Electrical calculator
- Pay calculator
- Fitness calculation
- Science calculation

---

# Module 2 — Decisions

## Weeks 3–4

### Theme

**Programs can make decisions.**

Students learn how software responds differently depending on conditions.

---

## Week 3 — Conditional Logic

### Video 1 — Boolean Expressions

Topics:

- `True`
- `False`
- Comparison operators
- Evaluating conditions

### Video 2 — If Statements

Topics:

```python
if condition:
    statement
```

Students learn how programs execute code only when a condition is true.

### Video 3 — If / Else

Topics:

```python
if condition:
    statement
else:
    statement
```

### Video 4 — Guided Decision Program

Build a program that makes a decision based on user input.

---

## Week 4 — Complex Decisions

### Video 1 — Elif

Topics:

```python
if condition:
    statement
elif condition:
    statement
else:
    statement
```

### Video 2 — Logical Operators

Topics:

- `and`
- `or`
- `not`

### Video 3 — Nested Logic

Topics:

- Decisions inside decisions
- When nesting is useful
- Avoiding unnecessary complexity

### Video 4 — Real-World Decision Model

Build a program that evaluates multiple conditions.

---

# Module 2 Guided Labs

Possible labs:

- Grade classification
- Age eligibility
- Shipping cost calculator
- Temperature warning system
- Equipment threshold monitor
- Password validation
- Loan qualification simulation
- Sensor state evaluation

---

# Module 2 Project

## Build a Decision System

Students create a program that:

1. Accepts multiple inputs
2. Evaluates conditions
3. Uses `if`, `elif`, and `else`
4. Uses Boolean logic
5. Produces a recommendation or classification

The student should design part of the logic themselves instead of simply filling in missing code.

---

# Module 3 — Repetition and Automation

## Weeks 5–6

### Theme

**If you are doing something repeatedly, make the computer do it.**

This module reinforces the Steel & Code idea that programming is a tool for automation.

---

## Week 5 — Loops

### Video 1 — Why Loops Matter

Topics:

- Repetition
- Automation
- Why manually repeating instructions is inefficient

### Video 2 — While Loops

Topics:

```python
while condition:
    statement
```

### Video 3 — Loop Control

Topics:

- Counters
- Sentinel values
- Input validation
- Preventing infinite loops

### Video 4 — Guided Automation

Build a program that repeatedly performs a task.

---

## Week 6 — Repeating Over Data

### Video 1 — For Loops

Topics:

```python
for item in sequence:
    statement
```

### Video 2 — Range

Topics:

```python
range()
```

Using ranges to repeat calculations.

### Video 3 — Counters and Accumulators

Topics:

- Counting events
- Adding totals
- Tracking values

### Video 4 — Computational Modeling Over Time

Use loops to calculate multiple values.

Example concept:

Instead of calculating one result, calculate 100 results and observe how changing one variable affects another.

This introduces the transition:

**Calculator → Program → Model**

---

# Module 3 Guided Labs

Possible labs:

- Repeated user input
- Running totals
- Average calculator
- Multiplication table
- Temperature range model
- Financial growth model
- Voltage/current table
- Repeated measurements
- Simple simulation

---

# Module 3 Project

## Automate a Repetitive Problem

Students identify or receive a repetitive task and automate it.

Possible examples:

- Analyze repeated measurements
- Calculate values across a range
- Generate a table
- Process multiple user entries
- Calculate cumulative totals
- Simulate repeated changes

---

# Module 4 — Building Programs

## Week 7

### Theme

**Stop writing isolated scripts. Start building programs.**

Students begin combining programming concepts into larger solutions.

---

## Video 1 — Functions

Topics:

```python
def function_name():
    pass
```

Topics include:

- Why functions matter
- Breaking problems into smaller pieces
- Reusing code

---

## Video 2 — Parameters and Return Values

Topics:

```python
def calculate(value):
    return value * 2
```

Topics include:

- Passing information into functions
- Returning results
- Separating responsibilities

---

## Video 3 — Collections

Introduce basic lists.

Topics:

```python
values = [10, 20, 30]
```

Students learn:

- Creating lists
- Accessing values
- Looping through lists
- Storing multiple values

---

## Video 4 — Files

Introduce basic file operations.

Topics:

- Reading simple files
- Writing simple files
- Saving program results
- Persistent data

Keep file handling introductory.

Advanced file processing belongs in later courses.

---

# Module 4 Guided Labs

Possible labs:

- Function-based calculator
- List processing
- Grade average calculator
- Data collection program
- Save results to a file
- Read simple datasets
- Modularize an existing program

---

# Module 4 Project

## Build a Multi-Part Python Application

The program should include:

- User input
- Variables
- Calculations
- Conditional logic
- Loops
- At least one function
- Structured or persistent data

The purpose is to combine everything learned throughout PF1.

---

# Week 8 — Computational Modeling Capstone

## Theme

**Use programming to understand a real-world problem.**

Students follow the complete Steel & Code process:

**Problem → Variables → Relationships → Algorithm → Python → Results → Interpretation**

Students should choose or receive a modeling problem.

---

# Capstone Tracks

## Engineering

Possible topics:

- Ohm's Law
- Voltage
- Current
- Resistance
- Power
- Circuit behavior

## Finance

Possible topics:

- Compound growth
- Savings
- Interest
- Investment growth
- Loan calculations

## Science

Possible topics:

- Population change
- Temperature change
- Motion
- Environmental data
- Growth models

## Business

Possible topics:

- Revenue
- Expenses
- Profit
- Break-even analysis
- Sales projections

## Everyday Automation

Possible topics:

- Budgeting
- Mileage
- Scheduling
- Inventory
- Household calculations

---

# Final Capstone Requirements

Students should:

1. Define the problem
2. Identify inputs
3. Identify outputs
4. Identify mathematical or logical relationships
5. Design the algorithm
6. Build the Python program
7. Test the program
8. Run multiple scenarios
9. Interpret the results
10. Explain what they learned

The goal is not to create a huge application.

The goal is to demonstrate that programming can be used to solve and understand real-world problems.

---

# Standard Lesson Page Template

Each lesson page should contain the same basic structure.

## Lesson Title

A clear descriptive title.

## Why This Matters

A short explanation of why the concept is useful.

## Video

An 8–15 minute instructional video.

## Key Concepts

Short reference notes.

Avoid turning this section into a textbook chapter.

## Example Code

Readable example code with syntax highlighting.

## Try in Workbench

Provide a button or link to open the example directly in the Steel & Code Workbench.

## Independent Challenge

Give students a similar but different problem to solve.

## Check Your Understanding

Approximately 3–5 short questions.

Possible formats:

- Multiple choice
- Predict the output
- Find the bug
- Explain what code does
- Small coding challenge

## What's Next

A short connection between the current lesson and the next lesson.

---

# Assessment Philosophy

Steel & Code should emphasize building rather than traditional testing.

Suggested assessment balance:

| Assessment Type | Approximate Weight |
|---|---|
| Knowledge Checks | 10% |
| Guided Labs | 20% |
| Module Projects | 40% |
| Computational Modeling Capstone | 30% |

Self-paced students may not need visible grades.

Course completion can instead be based on completing:

- Guided labs
- Four module projects
- Final computational modeling capstone

---

# Production Strategy

Do not attempt to build all course content simultaneously.

Build the course one complete module at a time.

## Phase 1 — Course Map

Finalize:

- Modules
- Lessons
- Projects
- Capstone

## Phase 2 — Module 1

Complete Module 1 entirely:

- Videos
- Lesson pages
- Example code
- Workbench labs
- Independent challenges
- Knowledge checks
- Module project

Test the full student experience.

## Phase 3 — Module 2

Repeat the same production process.

## Phase 4 — Module 3

Repeat the same production process.

## Phase 5 — Module 4

Repeat the same production process.

## Phase 6 — Capstone

Build the computational modeling capstone experience.

## Phase 7 — Platform Polish

After the learning experience works, add:

- Student accounts
- Progress tracking
- Course completion
- Certificates
- Payments
- Enrollment
- Email notifications
- Community integration
- Additional polish

---

# Self-Paced Course Architecture

The self-paced course should become the master version of PF1.

Other products can reuse the same material.

```text
PF1 Master Curriculum
│
├── Self-Paced Course
│
├── Founding Cohort
│   ├── Weekly Live Session
│   ├── Q&A
│   ├── Coaching
│   └── Community
│
├── TCCD Supporting Material
│
├── YouTube Content
│
├── Field Notes
│
└── Future PF1 Book
```

This prevents Steel & Code from maintaining multiple completely different versions of the same course.

---

# PF1 Version 1.0

## Programming Fundamentals I

### Python, Automation & Computational Modeling

**8 Weeks**

**4 Modules**

**4 Module Projects**

**1 Computational Modeling Capstone**

**Approximately 32 Short Videos**

**Built Around the Steel & Code Workbench**

### Core Philosophy

**Learn the process, not just the language.**

Programming is a tool for:

- Solving problems
- Automating work
- Exploring systems
- Modeling the real world
