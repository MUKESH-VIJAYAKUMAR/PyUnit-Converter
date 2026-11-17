"""Conversion data and calculations for Convertly."""

from __future__ import annotations

import math
from typing import Any


def _unit(name: str, symbol: str, factor: float, offset: float = 0.0) -> dict[str, Any]:
    return {"name": name, "symbol": symbol, "factor": factor, "offset": offset}


# Linear factors convert to the category's base unit. Temperature offsets convert
# to kelvin. Fuel economy is handled as an inverse relationship below.
CATEGORIES: dict[str, dict[str, Any]] = {
    "Length": {
        "icon": "↔", "description": "Distance and dimensions", "base": "Meter",
        "units": [
            _unit("Meter", "m", 1), _unit("Kilometer", "km", 1000),
            _unit("Centimeter", "cm", .01), _unit("Millimeter", "mm", .001),
            _unit("Micrometer", "μm", 1e-6), _unit("Nanometer", "nm", 1e-9),
            _unit("Mile", "mi", 1609.344), _unit("Yard", "yd", .9144),
            _unit("Foot", "ft", .3048), _unit("Inch", "in", .0254),
            _unit("Nautical mile", "nmi", 1852),
        ],
    },
    "Area": {
        "icon": "▧", "description": "Surfaces and land", "base": "Square meter",
        "units": [
            _unit("Square meter", "m²", 1), _unit("Square kilometer", "km²", 1e6),
            _unit("Square centimeter", "cm²", 1e-4), _unit("Square millimeter", "mm²", 1e-6),
            _unit("Hectare", "ha", 10000), _unit("Acre", "ac", 4046.8564224),
            _unit("Square mile", "mi²", 2589988.110336), _unit("Square yard", "yd²", .83612736),
            _unit("Square foot", "ft²", .09290304), _unit("Square inch", "in²", .00064516),
        ],
    },
    "Volume": {
        "icon": "◉", "description": "Liquid and cubic measures", "base": "Cubic meter",
        "units": [
            _unit("Cubic meter", "m³", 1), _unit("Liter", "L", .001),
            _unit("Milliliter", "mL", 1e-6), _unit("Cubic centimeter", "cm³", 1e-6),
            _unit("Cubic inch", "in³", 1.6387064e-5), _unit("Cubic foot", "ft³", .028316846592),
            _unit("Cubic yard", "yd³", .764554857984), _unit("US gallon", "US gal", .003785411784),
            _unit("US quart", "US qt", .000946352946), _unit("US pint", "US pt", .000473176473),
            _unit("US cup", "US cup", .0002365882365), _unit("US fluid ounce", "US fl oz", 2.95735295625e-5),
            _unit("US tablespoon", "US tbsp", 1.478676478125e-5), _unit("US teaspoon", "US tsp", 4.92892159375e-6),
            _unit("Imperial gallon", "Imp gal", .00454609), _unit("Imperial quart", "Imp qt", .0011365225),
            _unit("Imperial pint", "Imp pt", .00056826125), _unit("Imperial fluid ounce", "Imp fl oz", 2.84130625e-5),
            _unit("Barrel (oil)", "bbl", .158987294928),
        ],
    },
    "Mass": {
        "icon": "◌", "description": "Weight and mass", "base": "Kilogram",
        "units": [
            _unit("Kilogram", "kg", 1), _unit("Gram", "g", .001),
            _unit("Milligram", "mg", 1e-6), _unit("Microgram", "μg", 1e-9),
            _unit("Metric ton", "t", 1000), _unit("Pound", "lb", .45359237),
            _unit("Ounce", "oz", .028349523125), _unit("Stone", "st", 6.35029318),
            _unit("US short ton", "ton", 907.18474), _unit("Imperial long ton", "long ton", 1016.0469088),
            _unit("Carat", "ct", .0002),
        ],
    },
    "Time": {
        "icon": "◷", "description": "Time spans and durations", "base": "Second",
        "units": [
            _unit("Second", "s", 1), _unit("Millisecond", "ms", .001),
            _unit("Microsecond", "μs", 1e-6), _unit("Nanosecond", "ns", 1e-9),
            _unit("Minute", "min", 60), _unit("Hour", "h", 3600),
            _unit("Day", "d", 86400), _unit("Week", "wk", 604800),
            _unit("Month (30 days)", "mo", 2592000), _unit("Year (365.25 days)", "yr", 31557600),
        ],
    },
    "Speed": {
        "icon": "⌁", "description": "Travel and velocity", "base": "Meter per second",
        "units": [
            _unit("Meter per second", "m/s", 1), _unit("Kilometer per hour", "km/h", 1 / 3.6),
            _unit("Mile per hour", "mph", .44704), _unit("Foot per second", "ft/s", .3048),
            _unit("Knot", "kn", .514444444444),
        ],
    },
    "Temperature": {
        "icon": "°", "description": "Temperature scales", "base": "Kelvin",
        "units": [
            _unit("Celsius", "°C", 1, 273.15), _unit("Fahrenheit", "°F", 5 / 9, 255.3722222222222),
            _unit("Kelvin", "K", 1), _unit("Rankine", "°R", 5 / 9),
        ],
    },
    "Pressure": {
        "icon": "▤", "description": "Pressure and vacuum", "base": "Pascal",
        "units": [
            _unit("Pascal", "Pa", 1), _unit("Kilopascal", "kPa", 1000),
            _unit("Megapascal", "MPa", 1e6), _unit("Bar", "bar", 100000),
            _unit("Millibar", "mbar", 100), _unit("Atmosphere", "atm", 101325),
            _unit("Pound per square inch", "psi", 6894.757293168), _unit("Torr", "Torr", 133.3223684211),
            _unit("Millimeter of mercury", "mmHg", 133.322387415), _unit("Inch of mercury", "inHg", 3386.389),
        ],
    },
    "Energy": {
        "icon": "ϟ", "description": "Work, heat, and energy", "base": "Joule",
        "units": [
            _unit("Joule", "J", 1), _unit("Kilojoule", "kJ", 1000),
            _unit("Calorie", "cal", 4.184), _unit("Kilocalorie", "kcal", 4184),
            _unit("Watt-hour", "Wh", 3600), _unit("Kilowatt-hour", "kWh", 3.6e6),
            _unit("Electronvolt", "eV", 1.602176634e-19), _unit("BTU", "BTU", 1055.05585262),
            _unit("US therm", "thm", 105505585.262), _unit("Foot-pound", "ft·lbf", 1.3558179483314),
        ],
    },
    "Power": {
        "icon": "ϟ", "description": "Power and energy rate", "base": "Watt",
        "units": [
            _unit("Watt", "W", 1), _unit("Kilowatt", "kW", 1000),
            _unit("Megawatt", "MW", 1e6), _unit("Mechanical horsepower", "hp", 745.699871582),
            _unit("Metric horsepower", "PS", 735.49875), _unit("BTU per hour", "BTU/h", .29307107),
        ],
    },
    "Data storage": {
        "icon": "▣", "description": "Digital storage sizes", "base": "Byte",
        "units": [
            _unit("Bit", "bit", .125), _unit("Nibble", "nibble", .5), _unit("Byte", "B", 1),
            _unit("Kilobyte", "kB", 1000), _unit("Megabyte", "MB", 1e6),
            _unit("Gigabyte", "GB", 1e9), _unit("Terabyte", "TB", 1e12), _unit("Petabyte", "PB", 1e15),
            _unit("Kibibyte", "KiB", 1024), _unit("Mebibyte", "MiB", 1024**2),
            _unit("Gibibyte", "GiB", 1024**3), _unit("Tebibyte", "TiB", 1024**4),
            _unit("Pebibyte", "PiB", 1024**5),
        ],
    },
    "Data transfer": {
        "icon": "⇄", "description": "Network and transfer rates", "base": "Bit per second",
        "units": [
            _unit("Bit per second", "bit/s", 1), _unit("Kilobit per second", "kbit/s", 1000),
            _unit("Megabit per second", "Mbit/s", 1e6), _unit("Gigabit per second", "Gbit/s", 1e9),
            _unit("Byte per second", "B/s", 8), _unit("Kilobyte per second", "kB/s", 8000),
            _unit("Megabyte per second", "MB/s", 8e6),
        ],
    },
    "Fuel economy": {
        "icon": "⌖", "description": "Fuel use and efficiency", "base": "Kilometer per liter",
        "mode": "fuel", "units": [
            _unit("Liter per 100 kilometers", "L/100 km", 0), _unit("Kilometer per liter", "km/L", 1),
            _unit("Miles per US gallon", "mpg US", .4251437075),
            _unit("Miles per imperial gallon", "mpg Imp", .3540061899),
        ],
    },
    "Angle": {
        "icon": "∠", "description": "Angles and rotation", "base": "Radian",
        "units": [
            _unit("Radian", "rad", 1), _unit("Degree", "°", math.pi / 180),
            _unit("Gradian", "gon", math.pi / 200), _unit("Arcminute", "′", math.pi / 10800),
            _unit("Arcsecond", "″", math.pi / 648000), _unit("Turn", "turn", 2 * math.pi),
        ],
    },
    "Frequency": {
        "icon": "∿", "description": "Cycles and rotations", "base": "Hertz",
        "units": [
            _unit("Hertz", "Hz", 1), _unit("Kilohertz", "kHz", 1000),
            _unit("Megahertz", "MHz", 1e6), _unit("Gigahertz", "GHz", 1e9),
            _unit("Revolutions per minute", "rpm", 1 / 60), _unit("Beats per minute", "bpm", 1 / 60),
        ],
    },
    "Force": {
        "icon": "↗", "description": "Force and load", "base": "Newton",
        "units": [
            _unit("Newton", "N", 1), _unit("Kilonewton", "kN", 1000),
            _unit("Meganewton", "MN", 1e6), _unit("Dyne", "dyn", 1e-5),
            _unit("Kilogram-force", "kgf", 9.80665), _unit("Pound-force", "lbf", 4.4482216152605),
        ],
    },
    "Torque": {
        "icon": "⟳", "description": "Rotational force", "base": "Newton meter",
        "units": [
            _unit("Newton meter", "N·m", 1), _unit("Kilonewton meter", "kN·m", 1000),
            _unit("Pound-foot", "lb·ft", 1.3558179483314), _unit("Pound-inch", "lb·in", .1129848290276),
            _unit("Kilogram-force meter", "kgf·m", 9.80665),
        ],
    },
    "Density": {
        "icon": "▦", "description": "Mass per unit volume", "base": "Kilogram per cubic meter",
        "units": [
            _unit("Kilogram per cubic meter", "kg/m³", 1), _unit("Gram per cubic centimeter", "g/cm³", 1000),
            _unit("Gram per milliliter", "g/mL", 1000), _unit("Kilogram per liter", "kg/L", 1000),
            _unit("Pound per cubic foot", "lb/ft³", 16.01846337396),
            _unit("Pound per cubic inch", "lb/in³", 27679.9047102),
        ],
    },
    "Acceleration": {
        "icon": "↑", "description": "Change in velocity", "base": "Meter per second squared",
        "units": [
            _unit("Meter per second squared", "m/s²", 1), _unit("Foot per second squared", "ft/s²", .3048),
            _unit("Standard gravity", "g", 9.80665),
        ],
    },
    "Voltage": {
        "icon": "ϟ", "description": "Electric potential", "base": "Volt",
        "units": [
            _unit("Volt", "V", 1), _unit("Millivolt", "mV", .001),
            _unit("Microvolt", "μV", 1e-6), _unit("Kilovolt", "kV", 1000),
            _unit("Megavolt", "MV", 1e6),
        ],
    },
    "Current": {
        "icon": "⌁", "description": "Electric current", "base": "Ampere",
        "units": [
            _unit("Ampere", "A", 1), _unit("Milliampere", "mA", .001),
            _unit("Microampere", "μA", 1e-6), _unit("Kiloampere", "kA", 1000),
        ],
    },
    "Resistance": {
        "icon": "Ω", "description": "Electrical resistance", "base": "Ohm",
        "units": [
            _unit("Ohm", "Ω", 1), _unit("Milliohm", "mΩ", .001),
            _unit("Kiloohm", "kΩ", 1000), _unit("Megaohm", "MΩ", 1e6),
            _unit("Gigaohm", "GΩ", 1e9),
        ],
    },
    "Charge": {
        "icon": "✦", "description": "Electric charge", "base": "Coulomb",
        "units": [
            _unit("Coulomb", "C", 1), _unit("Millicoulomb", "mC", .001),
            _unit("Microcoulomb", "μC", 1e-6), _unit("Ampere-hour", "Ah", 3600),
            _unit("Milliampere-hour", "mAh", 3.6),
        ],
    },
    "Capacitance": {
        "icon": "▱", "description": "Electrical capacitance", "base": "Farad",
        "units": [
            _unit("Farad", "F", 1), _unit("Millifarad", "mF", .001),
            _unit("Microfarad", "μF", 1e-6), _unit("Nanofarad", "nF", 1e-9),
            _unit("Picofarad", "pF", 1e-12),
        ],
    },
    "Flow rate": {
        "icon": "≋", "description": "Volumetric flow", "base": "Cubic meter per second",
        "units": [
            _unit("Cubic meter per second", "m³/s", 1), _unit("Liter per second", "L/s", .001),
            _unit("Liter per minute", "L/min", 1 / 60000), _unit("Milliliter per minute", "mL/min", 1 / 6e7),
            _unit("US gallon per minute", "US gal/min", .003785411784 / 60),
            _unit("Cubic foot per second", "ft³/s", .028316846592),
        ],
    },
    "Illuminance": {
        "icon": "☼", "description": "Light falling on a surface", "base": "Lux",
        "units": [
            _unit("Lux", "lx", 1), _unit("Foot-candle", "fc", 10.7639104167),
            _unit("Phot", "ph", 10000),
        ],
    },
}


def unit_by_name(category: str, name: str) -> dict[str, Any]:
    for item in CATEGORIES[category]["units"]:
        if item["name"] == name:
            return item
    raise ValueError(f"Unknown unit: {name}")


def convert(value: float, category: str, from_unit: str, to_unit: str) -> float:
    """Convert a finite numeric value between two units in one category."""
    if category not in CATEGORIES:
        raise ValueError("Unknown category")
    if not math.isfinite(value):
        raise ValueError("Enter a finite number")

    source = unit_by_name(category, from_unit)
    target = unit_by_name(category, to_unit)
    mode = CATEGORIES[category].get("mode")

    if mode == "fuel":
        if value <= 0:
            raise ValueError("Fuel economy must be greater than zero")
        base = 100 / value if from_unit == "Liter per 100 kilometers" else value * source["factor"]
        if base <= 0:
            raise ValueError("Fuel economy must be greater than zero")
        return 100 / base if to_unit == "Liter per 100 kilometers" else base / target["factor"]

    base = value * source["factor"] + source["offset"]
    if category == "Temperature" and base < 0:
        raise ValueError("Temperature cannot be below absolute zero")
    return (base - target["offset"]) / target["factor"]


def format_number(value: float) -> str:
    """Format a result compactly while retaining useful conversion precision."""
    if not math.isfinite(value):
        return "—"
    if abs(value) < 5e-15:
        value = 0.0
    return f"{value:,.12g}"
