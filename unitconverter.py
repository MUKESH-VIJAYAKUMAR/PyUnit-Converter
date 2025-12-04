import tkinter as tk
from tkinter import ttk

# Conversion logic dictionaries
length_units = {
    "Meter": 1,
    "Kilometer": 1000,
    "Centimeter": 0.01,
    "Millimeter": 0.001,
    "Mile": 1609.34,
    "Yard": 0.9144,
    "Foot": 0.3048,
    "Inch": 0.0254
}

weight_units = {
    "Kilogram": 1,
    "Gram": 0.001,
    "Milligram": 0.000001,
    "Pound": 0.453592,
    "Ounce": 0.0283495
}

# Temperature functions
def temp_convert(value, from_unit, to_unit):
    value = float(value)
    if from_unit == "Celsius":
        if to_unit == "Fahrenheit": return (value * 9/5) + 32
        if to_unit == "Kelvin": return value + 273.15
        return value

    if from_unit == "Fahrenheit":
        if to_unit == "Celsius": return (value - 32) * 5/9
        if to_unit == "Kelvin": return (value - 32) * 5/9 + 273.15
        return value

    if from_unit == "Kelvin":
        if to_unit == "Celsius": return value - 273.15
        if to_unit == "Fahrenheit": return (value - 273.15) * 9/5 + 32
        return value

# Main converter function
def convert(*args):
    try:
        value = float(entry_value.get())
        category = combo_category.get()
        from_unit = combo_from.get()
        to_unit = combo_to.get()

        if category == "Length":
            result = value * (length_units[to_unit] / length_units[from_unit])

        elif category == "Weight":
            result = value * (weight_units[to_unit] / weight_units[from_unit])

        elif category == "Temperature":
            result = temp_convert(value, from_unit, to_unit)

        entry_result.config(state='normal')
        entry_result.delete(0, tk.END)
        entry_result.insert(0, round(result, 4))
        entry_result.config(state='readonly')

    except:
        entry_result.config(state='normal')
        entry_result.delete(0, tk.END)
        entry_result.insert(0, "Invalid")
        entry_result.config(state='readonly')

# When category changes
def update_units(event):
    category = combo_category.get()

    if category == "Length":
        units = list(length_units.keys())
    elif category == "Weight":
        units = list(weight_units.keys())
    else:
        units = ["Celsius", "Fahrenheit", "Kelvin"]

    combo_from['values'] = units
    combo_to['values'] = units

    combo_from.current(0)
    combo_to.current(1)

# UI Setup
root = tk.Tk()
root.title("PyUnitConverter")
root.geometry("380x300")
root.resizable(False, False)

title = tk.Label(root, text="PyUnitConverter", font=("Arial", 16, "bold"), fg="navy")
title.pack(pady=10)

frame = tk.Frame(root)
frame.pack(pady=10)

# Category
tk.Label(frame, text="Category:", font=("Arial", 10)).grid(row=0, column=0, padx=5)
combo_category = ttk.Combobox(frame, values=["Length", "Weight", "Temperature"], state="readonly")
combo_category.grid(row=0, column=1)
combo_category.current(0)
combo_category.bind("<<ComboboxSelected>>", update_units)

# From
tk.Label(frame, text="From:", font=("Arial", 10)).grid(row=1, column=0, padx=5)
combo_from = ttk.Combobox(frame, state="readonly")
combo_from.grid(row=1, column=1)
combo_from['values'] = list(length_units.keys())
combo_from.current(0)

# To
tk.Label(frame, text="To:", font=("Arial", 10)).grid(row=2, column=0, padx=5)
combo_to = ttk.Combobox(frame, state="readonly")
combo_to.grid(row=2, column=1)
combo_to['values'] = list(length_units.keys())
combo_to.current(1)

# Value Entry
tk.Label(root, text="Value:", font=("Arial", 10)).pack()
entry_value = tk.Entry(root, width=30)
entry_value.pack()
entry_value.insert(0, "1")

# Convert Button
btn = tk.Button(root, text="Convert", font=("Arial", 10, "bold"), command=convert)
btn.pack(pady=10)

# Result Entry
tk.Label(root, text="Result:", font=("Arial", 10)).pack()
entry_result = tk.Entry(root, width=30, state='readonly')
entry_result.pack()

root.mainloop()
