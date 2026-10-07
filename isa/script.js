// ======================================================
// ISA ATMOSPHERE CALCULATOR
// International Standard Atmosphere
// 0 - 84.852 km
// ======================================================


// ------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------

const R = 287.05287;       // Specific gas constant [J/(kg K)]

const GAMMA = 1.4;         // Ratio of specific heats

const G0 = 9.80665;        // Standard gravity [m/s²]

const T0 = 288.15;         // Sea-level temperature [K]

const P0 = 101325.0;       // Sea-level pressure [Pa]


// ------------------------------------------------------
// ISA LAYERS
// ------------------------------------------------------

// Geopotential altitude boundaries [m]

const hLayers = [
    0,
    11000,
    20000,
    32000,
    47000,
    51000,
    71000,
    84852
];


// Temperature lapse rates [K/m]

const lapseRates = [
    -0.0065,
     0.0000,
     0.0010,
     0.0028,
     0.0000,
    -0.0028,
    -0.0020
];


// ------------------------------------------------------
// CONVERT ALTITUDE TO METRES
// ------------------------------------------------------

function toMetres(value, unit) {

    switch (unit) {

        case "m":
            return value;

        case "km":
            return value * 1000;

        case "ft":
            return value * 0.3048;

        case "kft":
            return value * 1000 * 0.3048;

        default:
            return value;
    }
}


// ------------------------------------------------------
// ISA ATMOSPHERE
// ------------------------------------------------------

function isaAtmosphere(altitude) {

    // Limit altitude to ISA range

    const h = Math.max(
        0,
        Math.min(altitude, 84852)
    );


    // Base conditions at sea level

    let Tbase = T0;
    let Pbase = P0;


    // Find correct ISA layer

    for (let i = 0; i < lapseRates.length; i++) {

        const hBottom = hLayers[i];

        const hTop = hLayers[i + 1];

        const lapse = lapseRates[i];


        // Is the requested altitude inside this layer?

        if (h <= hTop) {

            const deltaH =
                h - hBottom;


            let T;
            let P;


            // --------------------------------------------------
            // Isothermal layer
            // --------------------------------------------------

            if (lapse === 0) {

                T = Tbase;

                P =
                    Pbase *
                    Math.exp(
                        -G0 * deltaH /
                        (R * Tbase)
                    );

            }


            // --------------------------------------------------
            // Gradient layer
            // --------------------------------------------------

            else {

                T =
                    Tbase +
                    lapse * deltaH;


                P =
                    Pbase *
                    Math.pow(
                        T / Tbase,
                        -G0 / (R * lapse)
                    );

            }


            // Density

            const rho =
                P / (R * T);


            // Speed of sound

            const a =
                Math.sqrt(
                    GAMMA * R * T
                );


            return {

                temperature: T,

                pressure: P,

                density: rho,

                soundSpeed: a

            };

        }


        // --------------------------------------------------
        // Move to next layer
        // --------------------------------------------------

        const deltaH =
            hTop - hBottom;


        if (lapse === 0) {

            // Isothermal layer

            Tbase = Tbase;

            Pbase =
                Pbase *
                Math.exp(
                    -G0 * deltaH /
                    (R * Tbase)
                );

        }

        else {

            // Gradient layer

            const Ttop =
                Tbase +
                lapse * deltaH;


            Pbase =
                Pbase *
                Math.pow(
                    Ttop / Tbase,
                    -G0 / (R * lapse)
                );


            Tbase =
                Ttop;
        }
    }


    // Fallback for the upper boundary

    const rho =
        Pbase /
        (R * Tbase);


    const a =
        Math.sqrt(
            GAMMA * R * Tbase
        );


    return {

        temperature: Tbase,

        pressure: Pbase,

        density: rho,

        soundSpeed: a

    };
}


// ======================================================
// CHART VARIABLES
// ======================================================

let temperatureChart = null;
let pressureChart = null;
let densityChart = null;
let soundChart = null;


// ======================================================
// GENERATE ISA DATA
// ======================================================

function generateISAData() {

    const temperature = [];
    const pressure = [];
    const density = [];
    const sound = [];


    // 250 m resolution

    for (
        let altitude = 0;
        altitude <= 84852;
        altitude += 250
    ) {

        const result =
            isaAtmosphere(altitude);


        const altitudeKm =
            altitude / 1000;


        temperature.push({

            x: result.temperature,

            y: altitudeKm

        });


        pressure.push({

            x: result.pressure / 1000,

            y: altitudeKm

        });


        density.push({

            x: result.density,

            y: altitudeKm

        });


        sound.push({

            x: result.soundSpeed,

            y: altitudeKm

        });
    }


    return {

        temperature,
        pressure,
        density,
        sound

    };
}


// ======================================================
// COMMON CHART OPTIONS
// ======================================================

function chartOptions(
    xTitle
) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        parsing: false,

        scales: {

            x: {

                type: "linear",

                title: {

                    display: true,

                    text: xTitle,

                    color: "#cbd5e1"

                },

                ticks: {

                    color: "#94a3b8"

                },

                grid: {

                    color: "#334155"

                }

            },


            y: {

                title: {

                    display: true,

                    text: "Altitude (km)",

                    color: "#cbd5e1"

                },

                ticks: {

                    color: "#94a3b8"

                },

                grid: {

                    color: "#334155"

                },

                min: 0,

                max: 84.852

            }

        },


        plugins: {

            legend: {

                labels: {

                    color: "#e2e8f0"

                }

            }

        }

    };
}


// ======================================================
// CREATE ALL CHARTS
// ======================================================

function createCharts(
    selectedAltitude
) {

    const data =
        generateISAData();


    const selected =
        isaAtmosphere(
            selectedAltitude
        );


    const selectedAltitudeKm =
        selectedAltitude / 1000;


    // --------------------------------------------------
    // Destroy previous charts
    // --------------------------------------------------

    if (temperatureChart)
        temperatureChart.destroy();

    if (pressureChart)
        pressureChart.destroy();

    if (densityChart)
        densityChart.destroy();

    if (soundChart)
        soundChart.destroy();


    // --------------------------------------------------
    // TEMPERATURE CHART
    // --------------------------------------------------

    const temperatureCtx =
        document
            .getElementById(
                "temperatureChart"
            );


    temperatureChart =
        new Chart(
            temperatureCtx,
            {

                type: "line",

                data: {

                    datasets: [

                        {

                            label:
                                "Temperature",

                            data:
                                data.temperature,

                            borderColor:
                                "#ef4444",

                            backgroundColor:
                                "rgba(239,68,68,0.15)",

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0.1

                        },


                        {

                            label:
                                "Selected Altitude",

                            data: [

                                {

                                    x:
                                        selected.temperature,

                                    y:
                                        selectedAltitudeKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 7,

                            showLine: false

                        }

                    ]

                },

                options:
                    chartOptions(
                        "Temperature (K)"
                    )
            }
        );


    // --------------------------------------------------
    // PRESSURE CHART
    // --------------------------------------------------

    const pressureCtx =
        document
            .getElementById(
                "pressureChart"
            );


    pressureChart =
        new Chart(
            pressureCtx,
            {

                type: "line",

                data: {

                    datasets: [

                        {

                            label:
                                "Pressure",

                            data:
                                data.pressure,

                            borderColor:
                                "#38bdf8",

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0.1

                        },


                        {

                            label:
                                "Selected Altitude",

                            data: [

                                {

                                    x:
                                        selected.pressure / 1000,

                                    y:
                                        selectedAltitudeKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 7,

                            showLine: false

                        }

                    ]

                },

                options:
                    chartOptions(
                        "Pressure (kPa)"
                    )
            }
        );


    // --------------------------------------------------
    // DENSITY CHART
    // --------------------------------------------------

    const densityCtx =
        document
            .getElementById(
                "densityChart"
            );


    densityChart =
        new Chart(
            densityCtx,
            {

                type: "line",

                data: {

                    datasets: [

                        {

                            label:
                                "Density",

                            data:
                                data.density,

                            borderColor:
                                "#22c55e",

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0.1

                        },


                        {

                            label:
                                "Selected Altitude",

                            data: [

                                {

                                    x:
                                        selected.density,

                                    y:
                                        selectedAltitudeKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 7,

                            showLine: false

                        }

                    ]

                },

                options:
                    chartOptions(
                        "Density (kg/m³)"
                    )
            }
        );


    // --------------------------------------------------
    // SPEED OF SOUND CHART
    // --------------------------------------------------

    const soundCtx =
        document
            .getElementById(
                "soundChart"
            );


    soundChart =
        new Chart(
            soundCtx,
            {

                type: "line",

                data: {

                    datasets: [

                        {

                            label:
                                "Speed of Sound",

                            data:
                                data.sound,

                            borderColor:
                                "#a78bfa",

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0.1

                        },


                        {

                            label:
                                "Selected Altitude",

                            data: [

                                {

                                    x:
                                        selected.soundSpeed,

                                    y:
                                        selectedAltitudeKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 7,

                            showLine: false

                        }

                    ]

                },

                options:
                    chartOptions(
                        "Speed of Sound (m/s)"
                    )
            }
        );
}


// ======================================================
// CALCULATE BUTTON
// ======================================================

function calculateISA() {

    const altitudeInput =
        document.getElementById(
            "altitude"
        );


    const unit =
        document
            .getElementById(
                "altitudeUnit"
            )
            .value;


    const value =
        parseFloat(
            altitudeInput.value
        );


    if (isNaN(value)) {

        alert(
            "Please enter a valid altitude."
        );

        return;
    }


    const altitude =
        toMetres(
            value,
            unit
        );


    if (
        altitude < 0 ||
        altitude > 84852
    ) {

        alert(
            "Altitude must be between 0 and 84.852 km."
        );

        return;
    }


    const result =
        isaAtmosphere(
            altitude
        );


    // ==================================================
    // UNIT CONVERSIONS
    // ==================================================

    const altitudeFt =
        altitude / 0.3048;


    const altitudeKft =
        altitudeFt / 1000;


    const temperatureRankine =
        result.temperature *
        9 / 5;


    const pressurePsf =
        result.pressure *
        0.0208854342;


    const densitySlug =
        result.density *
        0.00194032033;


    const soundSpeedFps =
        result.soundSpeed *
        3.280839895;


    // ==================================================
    // UPDATE TABLE
    // ==================================================

    document
        .getElementById(
            "altitudeSI"
        )
        .textContent =
        altitude.toFixed(2)
        + " m";


    document
        .getElementById(
            "altitudeFPS"
        )
        .textContent =
        altitudeKft.toFixed(3)
        + " kft";


    document
        .getElementById(
            "temperatureSI"
        )
        .textContent =
        result.temperature.toFixed(2)
        + " K";


    document
        .getElementById(
            "temperatureFPS"
        )
        .textContent =
        temperatureRankine.toFixed(2)
        + " °R";


    document
        .getElementById(
            "pressureSI"
        )
        .textContent =
        (result.pressure / 1000)
            .toFixed(4)
        + " kPa";


    document
        .getElementById(
            "pressureFPS"
        )
        .textContent =
        pressurePsf.toFixed(2)
        + " psf";


    document
        .getElementById(
            "densitySI"
        )
        .textContent =
        result.density.toFixed(6)
        + " kg/m³";


    document
        .getElementById(
            "densityFPS"
        )
        .textContent =
        densitySlug.toFixed(8)
        + " slug/ft³";


    document
        .getElementById(
            "soundSI"
        )
        .textContent =
        result.soundSpeed.toFixed(2)
        + " m/s";


    document
        .getElementById(
            "soundFPS"
        )
        .textContent =
        soundSpeedFps.toFixed(2)
        + " ft/s";


    // ==================================================
    // UPDATE CHARTS
    // ==================================================

    createCharts(
        altitude
    );
}


// ======================================================
// INITIAL LOAD
// ======================================================

window.addEventListener(
    "load",
    function () {

        calculateISA();

    }
);
