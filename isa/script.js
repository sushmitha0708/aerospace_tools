/* =====================================================
   ISA ATMOSPHERE CALCULATOR
   ===================================================== */


/* =====================================================
   ISA CONSTANTS
   ===================================================== */

const R = 287.05287;       // Specific gas constant, J/(kg·K)

const GAMMA = 1.4;         // Ratio of specific heats

const G0 = 9.80665;        // Standard gravity, m/s²

const T0 = 288.15;         // Sea-level temperature, K

const P0 = 101325.0;       // Sea-level pressure, Pa


/* =====================================================
   ISA LAYER BOUNDARIES
   ===================================================== */

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


/* =====================================================
   ISA TEMPERATURE LAPSE RATES
   ===================================================== */

const lapseRates = [

    -0.0065,    // 0–11 km

     0.0000,    // 11–20 km

     0.0010,    // 20–32 km

     0.0028,    // 32–47 km

     0.0000,    // 47–51 km

    -0.0028,    // 51–71 km

    -0.0020     // 71–84.852 km

];


/* =====================================================
   UNIT CONVERSION
   ===================================================== */

function toMetres(value, unit) {

    if (unit === "m") {

        return value;

    }

    if (unit === "km") {

        return value * 1000;

    }

    if (unit === "ft") {

        return value * 0.3048;

    }

    if (unit === "kft") {

        return value * 1000 * 0.3048;

    }

    return value;

}


/* =====================================================
   ISA ATMOSPHERE CALCULATION
   ===================================================== */

function isaAtmosphere(h) {

    /*
     * Limit altitude to the
     * ISA model range.
     */

    h = Math.max(
        0,
        Math.min(h, 84852)
    );


    /*
     * Conditions at the bottom
     * of the current layer.
     */

    let Tbase = T0;

    let Pbase = P0;


    /*
     * Determine which ISA layer
     * contains the requested altitude.
     */

    for (
        let i = 0;
        i < lapseRates.length;
        i++
    ) {

        const hb =
            hLayers[i];

        const ht =
            hLayers[i + 1];

        const L =
            lapseRates[i];


        /*
         * Requested altitude is
         * inside this layer.
         */

        if (h <= ht) {

            const dh =
                h - hb;


            let T;

            let P;


            /*
             * Isothermal layer.
             */

            if (L === 0) {

                T =
                    Tbase;


                P =
                    Pbase *
                    Math.exp(
                        -G0 * dh /
                        (R * Tbase)
                    );

            }


            /*
             * Gradient layer.
             */

            else {

                T =
                    Tbase +
                    L * dh;


                P =
                    Pbase *
                    Math.pow(
                        T / Tbase,
                        -G0 / (R * L)
                    );

            }


            /*
             * Density from
             * ideal gas law.
             */

            const rho =
                P /
                (R * T);


            /*
             * Speed of sound.
             */

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


        /*
         * Requested altitude is
         * above this entire layer.
         *
         * Move the base conditions
         * to the next layer.
         */

        const dh =
            ht - hb;


        /*
         * Isothermal layer.
         */

        if (L === 0) {

            Pbase =
                Pbase *
                Math.exp(
                    -G0 * dh /
                    (R * Tbase)
                );

        }


        /*
         * Gradient layer.
         */

        else {

            const Ttop =
                Tbase +
                L * dh;


            Pbase =
                Pbase *
                Math.pow(
                    Ttop / Tbase,
                    -G0 / (R * L)
                );


            Tbase =
                Ttop;

        }

    }


    /*
     * Fallback for the maximum
     * altitude boundary.
     */

    return {

        temperature:
            Tbase,

        pressure:
            Pbase,

        density:
            Pbase /
            (R * Tbase),

        soundSpeed:
            Math.sqrt(
                GAMMA *
                R *
                Tbase
            )

    };

}


/* =====================================================
   CHART VARIABLES
   ===================================================== */

let temperatureChart = null;

let pressureChart = null;

let densityChart = null;

let soundChart = null;


/* =====================================================
   GENERATE ISA PROFILE DATA
   ===================================================== */

function generateProfileData() {

    const temperature = [];

    const pressure = [];

    const density = [];

    const sound = [];


    /*
     * Generate altitude points.
     *
     * 250 m spacing provides a smooth
     * curve while keeping the chart
     * efficient.
     */

    const altitudes = [];


    for (
        let h = 0;
        h <= 84852;
        h += 250
    ) {

        altitudes.push(h);

    }


    /*
     * Explicitly add all ISA layer
     * boundaries.
     *
     * This ensures the changes in
     * lapse rate are represented
     * exactly.
     */

    hLayers.forEach(
        function (h) {

            if (
                !altitudes.includes(h)
            ) {

                altitudes.push(h);

            }

        }
    );


    /*
     * Sort altitude values.
     */

    altitudes.sort(
        function (a, b) {

            return a - b;

        }
    );


    /*
     * Calculate atmospheric
     * properties at every altitude.
     */

    altitudes.forEach(
        function (h) {

            const result =
                isaAtmosphere(h);


            const altitudeKm =
                h / 1000;


            /*
             * Temperature
             */

            temperature.push({

                x:
                    result.temperature,

                y:
                    altitudeKm

            });


            /*
             * Pressure
             *
             * Convert Pa → kPa
             */

            pressure.push({

                x:
                    result.pressure / 1000,

                y:
                    altitudeKm

            });


            /*
             * Density
             */

            density.push({

                x:
                    result.density,

                y:
                    altitudeKm

            });


            /*
             * Speed of sound
             */

            sound.push({

                x:
                    result.soundSpeed,

                y:
                    altitudeKm

            });

        }
    );


    return {

        temperature:
            temperature,

        pressure:
            pressure,

        density:
            density,

        sound:
            sound

    };

}


/* =====================================================
   COMMON CHART OPTIONS
   ===================================================== */

function chartOptions(xTitle) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        /*
         * We explicitly provide
         * {x, y} values.
         */

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

                    color:
                        "#94a3b8"

                },

                grid: {

                    color:
                        "#334155"

                }

            },


            y: {

                type: "linear",

                min: 0,

                max: 84.852,

                title: {

                    display: true,

                    text:
                        "Altitude (km)",

                    color:
                        "#cbd5e1"

                },

                ticks: {

                    color:
                        "#94a3b8"

                },

                grid: {

                    color:
                        "#334155"

                }

            }

        },


        plugins: {

            legend: {

                labels: {

                    color:
                        "#e2e8f0"

                }

            }

        }

    };

}


/* =====================================================
   CREATE ALL FOUR CHARTS
   ===================================================== */

function createCharts(selectedAltitude) {

    /*
     * Generate the complete
     * ISA atmosphere profile.
     */

    const data =
        generateProfileData();


    /*
     * Calculate the selected
     * altitude properties.
     */

    const selected =
        isaAtmosphere(
            selectedAltitude
        );


    const selectedKm =
        selectedAltitude / 1000;


    /*
     * Destroy existing charts
     * before creating new ones.
     */

    if (temperatureChart) {

        temperatureChart.destroy();

    }


    if (pressureChart) {

        pressureChart.destroy();

    }


    if (densityChart) {

        densityChart.destroy();

    }


    if (soundChart) {

        soundChart.destroy();

    }


    /* =================================================
       TEMPERATURE CHART
       ================================================= */

    temperatureChart =
        new Chart(

            document.getElementById(
                "temperatureChart"
            ),

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

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0

                        },


                        {

                            label:
                                "Selected altitude",

                            data: [

                                {

                                    x:
                                        selected.temperature,

                                    y:
                                        selectedKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 6,

                            pointHoverRadius: 8,

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


    /* =================================================
       PRESSURE CHART
       ================================================= */

    pressureChart =
        new Chart(

            document.getElementById(
                "pressureChart"
            ),

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

                            tension: 0

                        },


                        {

                            label:
                                "Selected altitude",

                            data: [

                                {

                                    x:
                                        selected.pressure /
                                        1000,

                                    y:
                                        selectedKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 6,

                            pointHoverRadius: 8,

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


    /* =================================================
       DENSITY CHART
       ================================================= */

    densityChart =
        new Chart(

            document.getElementById(
                "densityChart"
            ),

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

                            tension: 0

                        },


                        {

                            label:
                                "Selected altitude",

                            data: [

                                {

                                    x:
                                        selected.density,

                                    y:
                                        selectedKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 6,

                            pointHoverRadius: 8,

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


    /* =================================================
       SPEED OF SOUND CHART
       ================================================= */

    soundChart =
        new Chart(

            document.getElementById(
                "soundChart"
            ),

            {

                type: "line",

                data: {

                    datasets: [

                        {

                            label:
                                "Speed of sound",

                            data:
                                data.sound,

                            borderColor:
                                "#a78bfa",

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0

                        },


                        {

                            label:
                                "Selected altitude",

                            data: [

                                {

                                    x:
                                        selected.soundSpeed,

                                    y:
                                        selectedKm

                                }

                            ],

                            borderColor:
                                "#facc15",

                            backgroundColor:
                                "#facc15",

                            pointRadius: 6,

                            pointHoverRadius: 8,

                            showLine: false

                        }

                    ]

                },

                options:
                    chartOptions(
                        "Speed of sound (m/s)"
                    )

            }

        );

}


/* =====================================================
   CALCULATE BUTTON
   ===================================================== */

function calculateISA() {

    /*
     * Read altitude value.
     */

    const value =
        parseFloat(
            document.getElementById(
                "altitude"
            ).value
        );


    /*
     * Read selected unit.
     */

    const unit =
        document.getElementById(
            "altitudeUnit"
        ).value;


    /*
     * Validate input.
     */

    if (isNaN(value)) {

        alert(
            "Please enter a valid altitude."
        );

        return;

    }


    /*
     * Convert altitude to metres.
     */

    const altitude =
        toMetres(
            value,
            unit
        );


    /*
     * Validate ISA altitude range.
     */

    if (
        altitude < 0 ||
        altitude > 84852
    ) {

        alert(
            "Altitude must be between 0 and 84.852 km."
        );

        return;

    }


    /*
     * Calculate atmosphere.
     */

    const result =
        isaAtmosphere(
            altitude
        );


    /* =================================================
       UNIT CONVERSIONS
       ================================================= */

    /*
     * Metres → feet
     */

    const altitudeFt =
        altitude / 0.3048;


    /*
     * Feet → thousand feet
     */

    const altitudeKft =
        altitudeFt / 1000;


    /*
     * Kelvin → Rankine
     */

    const temperatureRankine =
        result.temperature *
        9 / 5;


    /*
     * Pa → psf
     */

    const pressurePsf =
        result.pressure *
        0.0208854342;


    /*
     * kg/m³ → slug/ft³
     */

    const densitySlug =
        result.density *
        0.00194032033;


    /*
     * m/s → ft/s
     */

    const soundSpeedFps =
        result.soundSpeed *
        3.280839895;


    /* =================================================
       UPDATE RESULTS TABLE
       ================================================= */

    /*
     * Altitude — SI
     */

    document.getElementById(
        "altitudeSI"
    ).textContent =
        altitude.toFixed(2)
        + " m";


    /*
     * Altitude — FPS
     */

    document.getElementById(
        "altitudeFPS"
    ).textContent =
        altitudeKft.toFixed(3)
        + " kft";


    /*
     * Temperature — SI
     */

    document.getElementById(
        "temperatureSI"
    ).textContent =
        result.temperature.toFixed(2)
        + " K";


    /*
     * Temperature — FPS
     */

    document.getElementById(
        "temperatureFPS"
    ).textContent =
        temperatureRankine.toFixed(2)
        + " °R";


    /*
     * Pressure — SI
     */

    document.getElementById(
        "pressureSI"
    ).textContent =
        (
            result.pressure / 1000
        ).toFixed(4)
        + " kPa";


    /*
     * Pressure — FPS
     */

    document.getElementById(
        "pressureFPS"
    ).textContent =
        pressurePsf.toFixed(2)
        + " psf";


    /*
     * Density — SI
     */

    document.getElementById(
        "densitySI"
    ).textContent =
        result.density.toFixed(6)
        + " kg/m³";


    /*
     * Density — FPS
     */

    document.getElementById(
        "densityFPS"
    ).textContent =
        densitySlug.toFixed(8)
        + " slug/ft³";


    /*
     * Speed of sound — SI
     */

    document.getElementById(
        "soundSI"
    ).textContent =
        result.soundSpeed.toFixed(2)
        + " m/s";


    /*
     * Speed of sound — FPS
     */

    document.getElementById(
        "soundFPS"
    ).textContent =
        soundSpeedFps.toFixed(2)
        + " ft/s";


    /* =================================================
       UPDATE FOUR PLOTS
       ================================================= */

    createCharts(
        altitude
    );

}


/* =====================================================
   INITIAL LOAD
   ===================================================== */

window.addEventListener(
    "load",
    function () {

        calculateISA();

    }
);
