# Steel & Code — Programming Fundamentals I

## Module 1 — Foundations

# Lesson 1 — Programming Is Automation

## Lesson Theme

**Programming is giving a computer a clear process to follow.**

This lesson introduces programming as a tool for solving problems and automating tasks.

The focus is not Python syntax.

The focus is understanding the basic programming process:

**Input → Process → Output**

---

# Lesson Objectives

By the end of this lesson, students should be able to:

- Explain what a computer program is
- Describe programming as a sequence of instructions
- Explain the concept of automation
- Identify input, process, and output in a simple problem
- Recognize tasks that could be automated
- Run a simple Python program
- Modify a simple Python program
- Explain what `print()` does

---

# Estimated Lesson Time

| Activity              | Estimated Time |
| --------------------- | -------------: |
| Video                 |   8–12 minutes |
| Guided Lab            |  10–15 minutes |
| Independent Challenge |  10–20 minutes |
| Knowledge Check       |      5 minutes |
| Total                 |  35–50 minutes |

---

# Why This Matters

Computers are very fast, but they only perform the instructions they are given.

Programming is the process of describing a task clearly enough that a computer can perform it.

Many programs can be understood using three basic parts:

```text
Input → Process → Output
```

A user or system provides information.

The program does something with that information.

The program produces a result.

Learning to recognize this pattern is one of the foundations of programming.

---

# Video

## Video Title

**Programming Is Automation**

## Suggested Length

**8–12 minutes**

---

# Video Outline

## 1. Opening

Possible opening:

> When most people hear the word programming, they immediately think about code.

> But code is really just the language we use to describe a process.

> Programming starts before we ever type Python.

Introduce the main idea:

**Programming is about solving problems by creating clear instructions.**

---

## 2. What Is a Program?

A program is a set of instructions that tells a computer what to do.

Simple examples include:

- Calculate a total
- Display information
- Sort data
- Send a message
- Check a password
- Process a transaction
- Analyze measurements

Programs may be small or extremely large, but they are all built from instructions.

---

## 3. Programming as Automation

Automation means allowing a computer to perform work that would otherwise need to be done manually.

Example:

Suppose someone needs to calculate:

```text
Hourly pay × Hours worked
```

They could perform the calculation manually every time.

Or they could build a program that:

1. Asks for hours worked
2. Asks for hourly pay
3. Performs the calculation
4. Displays the result

The computer performs the repeated process.

That is automation.

---

## 4. Input → Process → Output

Introduce the model:

```text
Input
  ↓
Process
  ↓
Output
```

### Example

Problem:

Calculate the total cost of purchasing several identical items.

### Input

```text
Price
Quantity
```

### Process

```text
Total = Price × Quantity
```

### Output

```text
Total Cost
```

Explain that programmers should understand this process before writing code.

---

## 5. Code Comes After the Process

Show:

```python
price = 10
quantity = 3

total = price * quantity

print(total)
```

Do not deeply explain variables yet.

Instead explain what the program is doing conceptually.

```text
Input/Data
price = 10
quantity = 3

Process
total = price * quantity

Output
print(total)
```

The purpose is to connect the code to the process.

---

## 6. First Python Program

Show:

```python
print("Welcome to Steel & Code")
```

Explain:

`print()` tells Python to display information.

Then add:

```python
print("Programming is a tool for solving problems.")
```

Run the program.

Modify the text.

Run it again.

Emphasize experimentation.

---

## 7. Errors Are Normal

Briefly explain that students will make mistakes.

Examples may include:

```python
print("Hello)
```

or:

```python
pritn("Hello")
```

Explain:

- Errors are normal
- Read the error
- Look at the line
- Compare what you typed
- Fix one thing at a time

Do not deeply teach debugging yet.

The goal is simply to normalize the process.

---

## 8. Closing

Reinforce:

**Programming is not memorizing Python commands.**

Programming is:

1. Understanding a problem
2. Describing the process
3. Translating that process into code
4. Testing the result

End with:

```text
Problem → Process → Code → Result
```

---

# Key Concepts

## Program

A set of instructions that tells a computer what to do.

## Programming

The process of designing and creating instructions that solve a problem or perform a task.

## Automation

Using a computer to perform work automatically.

## Input

Information provided to a program.

## Process

The work or calculation performed by the program.

## Output

The result produced by the program.

---

# module-1-lesson-1.md 
# Example Code

## Example 1

```python
print("Welcome to Steel & Code")
```

Expected output:

```text
Welcome to Steel & Code
```

---

## Example 2

```python
print("Programming is a tool for solving problems.")
print("Python allows us to describe the process.")
```

Expected output:

```text
Programming is a tool for solving problems.
Python allows us to describe the process.
```

---

## Example 3 — Preview of a Process

```python
price = 10
quantity = 3

total = price * quantity

print(total)
```

Expected output:

```text
30
```

Students do not need to understand every line yet.

The purpose is to identify:

```text
Data → Process → Output
```

---

# Guided Workbench Lab

## Lab Title

**Hello, Steel & Code**

## Purpose

Students run and modify their first Python program.

---

## Starter Code

```python
print("Welcome to Steel & Code")
print("Programming is a tool for solving problems.")
```

---

## Student Instructions

### Step 1

Run the program.

Observe the output.

### Step 2

Change the first message.

Example:

```python
print("My first Python program")
```

Run the program again.

### Step 3

Add another `print()` statement.

Example:

```python
print("I am learning how computers follow instructions.")
```

### Step 4

Run the program.

Make another change.

Run it again.

---

# Experiment

Ask students to intentionally change:

```python
print("Hello")
```

to:

```python
print(Hello)
```

Run the code.

Observe the error.

Then restore the quotation marks.

Purpose:

Students see immediately that errors are part of experimentation.

---

# Guided Lab Reflection

Students answer:

1. What does `print()` do?
2. What happened when you changed the text?
3. What happened when you removed the quotation marks?
4. What did you do to fix the problem?

---

# Independent Challenge

## Challenge — Introduce Yourself

Create a Python program that displays:

1. Your name
2. A career, subject, or skill you are interested in
3. One task you would like a computer to automate

Example output:

```text
My name is Jordan.
I am interested in engineering.
I would like to automate repetitive calculations.
```

---

# Challenge Requirements

Your program must:

- Use at least three `print()` statements
- Display three different pieces of information
- Run without errors
- Produce readable output

---

# Optional Extension

Add a title to the program.

Example:

```python
print("--- About Me ---")
```

Experiment with additional messages.

---

# Knowledge Check

## Question 1

Which statement best describes a computer program?

A. A collection of random commands
B. A set of instructions that tells a computer what to do
C. A type of computer hardware
D. A programming language

### Correct Answer

**B**

---

## Question 2

Which sequence represents the basic structure discussed in this lesson?

A. Process → Output → Input
B. Output → Input → Process
C. Input → Process → Output
D. Input → Output → Process

### Correct Answer

**C**

---

## Question 3

What does automation mean?

A. Writing code without testing it
B. Using a computer to perform work automatically
C. Memorizing programming commands
D. Installing Python

### Correct Answer

**B**

---

## Question 4

Consider this problem:

A program calculates weekly pay using hours worked and hourly pay.

Identify the input.

### Answer

- Hours worked
- Hourly pay rate

---

## Question 5

What does this code do?

```python
print("Hello")
```

### Answer

It displays:

```text
Hello
```

---

# Predict the Output

What will this program display?

```python
print("Steel")
print("Code")
```

### Answer

```text
Steel
Code
```

---

# Find the Bug

What is wrong with this code?

```python
print("Welcome to Steel & Code)
```

### Answer

The closing quotation mark is missing.

Correct code:

```python
print("Welcome to Steel & Code")
```

---

# Lesson Completion Criteria

Students complete Lesson 1 when they have:

- Watched the lesson video
- Run the guided Workbench example
- Modified the example
- Completed the intentional error experiment
- Completed the independent challenge
- Completed the knowledge check

---

# Workbench Implementation

## Try in Workbench Button

The lesson page should include:

**Try in Workbench**

The button should load:

```python
print("Welcome to Steel & Code")
print("Programming is a tool for solving problems.")
```

---

# Workbench Goals

The student should be able to:

- Run the code
- Edit the code
- Add additional statements
- Clear output
- Run the modified program
- Reset the starter code

---

# Lesson Page Structure

The web lesson page should follow this order:

```text
Lesson Title

Why This Matters

Video

Key Concepts

Example Code

Try in Workbench

Guided Lab

Independent Challenge

Knowledge Check

What's Next
```

---

# What's Next

In the next lesson, students will learn how programs store information using variables.

Preview:

```python
name = "Alex"
age = 21
temperature = 72.5
```

Students will begin moving from simply displaying information to storing and working with data.

---

# Instructor Production Checklist

## Video

- [ ] Record Programming Is Automation
- [ ] Keep video approximately 8–12 minutes
- [ ] Explain input → process → output
- [ ] Demonstrate `print()`
- [ ] Demonstrate modifying code
- [ ] Demonstrate a simple error
- [ ] Reinforce programming as problem solving

## Lesson Content

- [ ] Why This Matters
- [ ] Key concepts
- [ ] Example code
- [ ] Guided lab
- [ ] Independent challenge
- [ ] Knowledge check
- [ ] What's Next

## Workbench

- [ ] Starter code created
- [ ] Try in Workbench button connected
- [ ] Run functionality tested
- [ ] Reset functionality tested
- [ ] Clear output tested
- [ ] Mobile layout checked

---

# Definition of Done

Lesson 1 is complete when a brand-new student can:

1. Understand the basic idea of programming
2. Explain input → process → output
3. Run Python code
4. Modify Python code
5. Recover from a simple error
6. Complete a small program independently

The student should leave the lesson thinking:

**I can make the computer follow instructions.**

