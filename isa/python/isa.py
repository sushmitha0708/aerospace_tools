import math


# ==========================================================
# ISA CONSTANTS
# ==========================================================

T0 = 288.15
P0 = 101325.0

R = 287.05287
g = 9.80665
gamma = 1.4


# ==========================================================
# ISA LAYERS
#
# altitude [m]
# temperature [K]
# lapse rate [K/m]
# ==========================================================

LAYERS = [
    (0.0,       288.15,  -0.0065),
    (11000.0,   216.65,   0.0),
    (20000.0,   216.65,   0.0010),
    (32000.0,   228.65,   0.0028),
    (47000.0,   270.65,   0.0),
    (51000.0,   270.65,  -0.0028),
    (71000.0,   214.65,  -0.0020),
    (84852.0,   186.946,   0.0),
]


MAX_ALTITUDE = LAYERS[-1][0]


# ==========================================================
# CALCULATE PRESSURE AT EACH LAYER BASE
# ==========================================================

def calculate_base_pressures():

    pressures = [P0]

    for i in range(len(LAYERS) - 1):

        h_base, T_base, lapse = LAYERS[i]

        h_next = LAYERS[i + 1][0]

        delta_h = h_next - h_base

        if lapse == 0:

            P_next = pressures[i] * math.exp(
                -g * delta_h / (R * T_base)
            )

        else:

            T_next = T_base + lapse * delta_h

            P_next = pressures[i] * (
                T_next / T_base
            ) ** (
                -g / (R * lapse)
            )

        pressures.append(P_next)

    return pressures


BASE_PRESSURES = calculate_base_pressures()


# ==========================================================
# FIND ISA LAYER
# ==========================================================

def find_layer(altitude):

    for i in range(len(LAYERS) - 1, -1, -1):

        if altitude >= LAYERS[i][0]:
            return i

    return 0


# ==========================================================
# ISA CALCULATION
# ==========================================================

def isa_atmosphere(altitude):

    if not isinstance(altitude, (int, float)):
        raise TypeError(
            "Altitude must be a number."
        )

    if altitude < 0:
        raise ValueError(
            "Altitude cannot be below 0 m."
        )

    if altitude > MAX_ALTITUDE:
        raise ValueError(
            f"Altitude must be between 0 and "
            f"{MAX_ALTITUDE / 1000:.3f} km."
        )

    # Find correct atmospheric layer
    i = find_layer(altitude)

    h_base, T_base, lapse = LAYERS[i]

    P_base = BASE_PRESSURES[i]

    delta_h = altitude - h_base

    # Temperature
    T = T_base + lapse * delta_h

    # Pressure
    if lapse == 0:

        P = P_base * math.exp(
            -g * delta_h / (R * T_base)
        )

    else:

        P = P_base * (
            T / T_base
        ) ** (
            -g / (R * lapse)
        )

    # Density
    rho = P / (R * T)

    # Speed of sound
    a = math.sqrt(
        gamma * R * T
    )

    return T, P, rho, a


# ==========================================================
# UNIT CONVERSION
# ==========================================================

def to_metres(value, unit):

    if unit == "m":
        return value

    if unit == "km":
        return value * 1000.0

    if unit == "ft":
        return value * 0.3048

    if unit == "kft":
        return value * 1000.0 * 0.3048

    raise ValueError(
        f"Unknown altitude unit: {unit}"
    )


def from_metres(value, unit):

    if unit == "m":
        return value

    if unit == "km":
        return value / 1000.0

    if unit == "ft":
        return value / 0.3048

    if unit == "kft":
        return value / (1000.0 * 0.3048)

    raise ValueError(
        f"Unknown altitude unit: {unit}"
    )
