import sys

from PySide6.QtCore import Qt

from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QComboBox,
    QTableWidget,
    QTableWidgetItem,
    QHeaderView,
    QFormLayout,
)

from isa import isa_atmosphere, to_metres
from plot_widget import ISAPlot


class ISACalculator(QWidget):

    def __init__(self):

        super().__init__()

        self.setWindowTitle(
            "ISA Atmosphere Calculator"
        )

        # ==========================================
        # ALTITUDE INPUT
        # ==========================================

        self.altitude_input = QLineEdit()

        self.altitude_input.setPlaceholderText(
            "Enter altitude"
        )

        # ==========================================
        # ALTITUDE UNIT
        # ==========================================

        self.altitude_unit = QComboBox()

        self.altitude_unit.addItems([
            "m",
            "km",
            "ft",
            "kft"
        ])

        # ==========================================
        # CALCULATE BUTTON
        # ==========================================

        self.calculate_button = QPushButton(
            "Calculate"
        )

        # ==========================================
        # INPUT FORM
        # ==========================================

        form = QFormLayout()

        altitude_row = QHBoxLayout()

        altitude_row.addWidget(
            self.altitude_input
        )

        altitude_row.addWidget(
            self.altitude_unit
        )

        form.addRow(
            "Altitude:",
            altitude_row
        )

        # ==========================================
        # RESULT TABLE
        # ==========================================

        self.result_table = QTableWidget()

        self.result_table.setRowCount(5)

        self.result_table.setColumnCount(3)

        self.result_table.setHorizontalHeaderLabels([
            "Property",
            "SI",
            "FPS"
        ])

        self.result_table.horizontalHeader().setSectionResizeMode(
            QHeaderView.Stretch
        )

        self.result_table.setEditTriggers(
            QTableWidget.NoEditTriggers
        )

        # ==========================================
        # MAIN LAYOUT
        # ==========================================

        layout = QVBoxLayout()

        layout.addLayout(
            form
        )

        layout.addWidget(
            self.calculate_button
        )

        layout.addWidget(
            self.result_table
        )

        # ==========================================
        # ISA PLOT
        # ==========================================

        self.plot = ISAPlot()

        layout.addWidget(
            self.plot
        )

        # ==========================================
        # SET MAIN LAYOUT
        # ==========================================

        self.setLayout(
            layout
        )

        # ==========================================
        # BUTTON CONNECTION
        # ==========================================

        self.calculate_button.clicked.connect(
            self.calculate
        )


    # ==================================================
    # CALCULATE ISA
    # ==================================================

    def calculate(self):

        try:

            # ==========================================
            # Read altitude
            # ==========================================

            altitude = float(
                self.altitude_input.text()
            )

            unit = self.altitude_unit.currentText()

            altitude_m = to_metres(
                altitude,
                unit
            )

            # ==========================================
            # ISA calculation
            # ==========================================

            T, P, rho, a = isa_atmosphere(
                altitude_m
            )

            # ==========================================
            # FPS conversions
            # ==========================================

            altitude_ft = altitude_m / 0.3048

            altitude_kft = altitude_ft / 1000.0

            T_rankine = T * 9.0 / 5.0

            P_psf = P * 0.0208854342

            rho_slug = rho * 0.00194032033

            a_fts = a * 3.280839895

            # ==========================================
            # Result table data
            # ==========================================

            results = [

                (
                    "Altitude",
                    f"{altitude_m / 1000:.3f} km",
                    f"{altitude_kft:.3f} kft"
                ),

                (
                    "Temperature (T)",
                    f"{T:.2f} K",
                    f"{T_rankine:.2f} °R"
                ),

                (
                    "Pressure (P)",
                    f"{P / 1000:.4f} kPa",
                    f"{P_psf:.2f} psf"
                ),

                (
                    "Density (ρ)",
                    f"{rho:.6f} kg/m³",
                    f"{rho_slug:.8f} slug/ft³"
                ),

                (
                    "Speed of sound (a)",
                    f"{a:.2f} m/s",
                    f"{a_fts:.2f} ft/s"
                )

            ]

            # ==========================================
            # Update result table
            # ==========================================

            for row, values in enumerate(results):

                for column, value in enumerate(values):

                    item = QTableWidgetItem(
                        value
                    )

                    item.setTextAlignment(
                        Qt.AlignCenter
                    )

                    self.result_table.setItem(
                        row,
                        column,
                        item
                    )

            # ==========================================
            # Update plot
            # ==========================================

            self.plot.set_selected_altitude(
                altitude_m
            )

        except (ValueError, TypeError) as error:

            self.result_table.clearContents()

            print(
                f"Error: {error}"
            )


# ==================================================
# START APPLICATION
# ==================================================

app = QApplication(sys.argv)

window = ISACalculator()

window.resize(
    1200,
    800
)

window.show()

sys.exit(
    app.exec()
)
