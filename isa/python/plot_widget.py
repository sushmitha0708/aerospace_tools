import numpy as np

from matplotlib.figure import Figure
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg

from isa import isa_atmosphere


class ISAPlot(FigureCanvasQTAgg):

    def __init__(self):

        # ==========================================
        # Create Matplotlib figure
        # ==========================================

        self.figure = Figure(
            figsize=(10, 5)
        )

        super().__init__(
            self.figure
        )

        # ==========================================
        # Create axes
        # ==========================================

        self.ax_temperature = self.figure.add_subplot(131)

        self.ax_pressure = self.figure.add_subplot(132)

        self.ax_density = self.figure.add_subplot(133)

        # ==========================================
        # Selected altitude
        # ==========================================

        self.selected_altitude = None

        # ==========================================
        # Initial plot
        # ==========================================

        self.plot_isa()


    # ==================================================
    # PLOT ISA
    # ==================================================

    def plot_isa(self):

        # ==========================================
        # ISA altitude range
        # ==========================================

        altitudes = np.linspace(
            0,
            84852,
            500
        )

        temperatures = []
        pressures = []
        densities = []

        # ==========================================
        # Calculate ISA
        # ==========================================

        for altitude in altitudes:

            T, P, rho, a = isa_atmosphere(
                altitude
            )

            temperatures.append(T)
            pressures.append(P)
            densities.append(rho)

        altitude_km = altitudes / 1000.0


        # ==========================================
        # Clear previous plots
        # ==========================================

        self.ax_temperature.clear()
        self.ax_pressure.clear()
        self.ax_density.clear()


        # ==========================================
        # TEMPERATURE
        # ==========================================

        self.ax_temperature.plot(
            temperatures,
            altitude_km,
            linewidth=2,
            color="tab:red"
        )

        self.ax_temperature.set_xlabel(
            "Temperature (K)"
        )

        self.ax_temperature.set_ylabel(
            "Altitude (km)"
        )

        self.ax_temperature.set_title(
            "ISA Temperature"
        )

        self.ax_temperature.grid(
            True,
            linestyle="--",
            alpha=0.5
        )


        # ==========================================
        # PRESSURE
        # ==========================================

        self.ax_pressure.plot(
            pressures,
            altitude_km,
            linewidth=2,
            color="tab:blue"
        )

        self.ax_pressure.set_xlabel(
            "Pressure (Pa)"
        )

        self.ax_pressure.set_ylabel(
            "Altitude (km)"
        )

        self.ax_pressure.set_title(
            "ISA Pressure"
        )

        # Pressure changes by several orders
        # of magnitude, so use logarithmic scale.
        self.ax_pressure.set_xscale(
            "log"
        )

        self.ax_pressure.grid(
            True,
            which="both",
            linestyle="--",
            alpha=0.5
        )


        # ==========================================
        # DENSITY
        # ==========================================

        self.ax_density.plot(
            densities,
            altitude_km,
            linewidth=2,
            color="tab:green"
        )

        self.ax_density.set_xlabel(
            "Density (kg/m³)"
        )

        self.ax_density.set_ylabel(
            "Altitude (km)"
        )

        self.ax_density.set_title(
            "ISA Density"
        )

        self.ax_density.grid(
            True,
            linestyle="--",
            alpha=0.5
        )


        # ==========================================
        # ISA LAYER BOUNDARIES
        # ==========================================

        layer_altitudes = [
            0,
            11,
            20,
            32,
            47,
            51,
            71,
            84.852
        ]

        for altitude in layer_altitudes:

            self.ax_temperature.axhline(
                altitude,
                color="gray",
                linestyle=":",
                alpha=0.5
            )

            self.ax_pressure.axhline(
                altitude,
                color="gray",
                linestyle=":",
                alpha=0.5
            )

            self.ax_density.axhline(
                altitude,
                color="gray",
                linestyle=":",
                alpha=0.5
            )


        # ==========================================
        # SELECTED ALTITUDE
        # ==========================================

        if self.selected_altitude is not None:

            self.mark_altitude(
                self.selected_altitude
            )


        # ==========================================
        # Final layout
        # ==========================================

        self.figure.tight_layout()

        self.draw()


    # ==================================================
    # MARK SELECTED ALTITUDE
    # ==================================================

    def mark_altitude(self, altitude):

        # ==========================================
        # Check altitude range
        # ==========================================

        if altitude < 0 or altitude > 84852:

            return


        # ==========================================
        # Calculate ISA properties
        # ==========================================

        T, P, rho, a = isa_atmosphere(
            altitude
        )

        altitude_km = altitude / 1000.0


        # ==========================================
        # TEMPERATURE MARKER
        # ==========================================

        self.ax_temperature.scatter(
            T,
            altitude_km,
            color="red",
            edgecolor="black",
            s=80,
            zorder=10
        )

        self.ax_temperature.annotate(
            f"{T:.2f} K",
            (T, altitude_km),
            xytext=(8, 8),
            textcoords="offset points",
            fontsize=9,
            fontweight="bold"
        )


        # ==========================================
        # PRESSURE MARKER
        # ==========================================

        self.ax_pressure.scatter(
            P,
            altitude_km,
            color="blue",
            edgecolor="black",
            s=80,
            zorder=10
        )

        self.ax_pressure.annotate(
            f"{P / 1000:.3f} kPa",
            (P, altitude_km),
            xytext=(8, 8),
            textcoords="offset points",
            fontsize=9,
            fontweight="bold"
        )


        # ==========================================
        # DENSITY MARKER
        # ==========================================

        self.ax_density.scatter(
            rho,
            altitude_km,
            color="green",
            edgecolor="black",
            s=80,
            zorder=10
        )

        self.ax_density.annotate(
            f"{rho:.4f} kg/m³",
            (rho, altitude_km),
            xytext=(8, 8),
            textcoords="offset points",
            fontsize=9,
            fontweight="bold"
        )


        # ==========================================
        # HORIZONTAL SELECTED ALTITUDE LINE
        # ==========================================

        axes = [
            self.ax_temperature,
            self.ax_pressure,
            self.ax_density
        ]

        for ax in axes:

            ax.axhline(
                altitude_km,
                color="black",
                linestyle="--",
                linewidth=1.2,
                alpha=0.5
            )


    # ==================================================
    # SET SELECTED ALTITUDE
    # ==================================================

    def set_selected_altitude(self, altitude):

        self.selected_altitude = altitude

        self.plot_isa()
