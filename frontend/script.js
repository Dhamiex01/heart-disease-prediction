document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("patientForm");

    const submitButton =
        document.getElementById("submitButton");

    const formError =
        document.getElementById("formError");


    /* =========================================================
       VALIDATION RULES
    ========================================================= */

    const rules = {

        age: {
            min: 18,
            max: 120,
            label: "Age"
        },

        trestbps: {
            min: 60,
            max: 250,
            label: "Resting Blood Pressure"
        },

        chol: {
            min: 50,
            max: 700,
            label: "Serum Cholesterol"
        },

        thalach: {
            min: 50,
            max: 250,
            label: "Maximum Heart Rate"
        },

        oldpeak: {
            min: 0,
            max: 10,
            label: "ST Depression"
        }

    };


    /* =========================================================
       GET ERROR ELEMENT
    ========================================================= */

    function getErrorElement(fieldId) {

        return document.getElementById(
            fieldId + "Error"
        );

    }


    /* =========================================================
       CLEAR FIELD ERROR
    ========================================================= */

    function clearFieldError(fieldId) {

        const field =
            document.getElementById(fieldId);

        const error =
            getErrorElement(fieldId);

        if (field) {

            field.classList.remove(
                "input-error"
            );

        }

        if (error) {

            error.textContent = "";

        }

    }


    /* =========================================================
       SHOW FIELD ERROR
    ========================================================= */

    function showFieldError(
        fieldId,
        message
    ) {

        const field =
            document.getElementById(fieldId);

        const error =
            getErrorElement(fieldId);

        if (field) {

            field.classList.add(
                "input-error"
            );

        }

        if (error) {

            error.textContent = message;

        }

    }


    /* =========================================================
       VALIDATE NUMERICAL FIELD
    ========================================================= */

    function validateNumber(fieldId) {

        const field =
            document.getElementById(fieldId);

        if (!field) {

            return false;

        }

        const value =
            field.value.trim();

        clearFieldError(fieldId);


        /* EMPTY */

        if (value === "") {

            showFieldError(
                fieldId,
                `${rules[fieldId].label} is required.`
            );

            return false;

        }


        const number =
            Number(value);


        /* NOT A NUMBER */

        if (!Number.isFinite(number)) {

            showFieldError(
                fieldId,
                `${rules[fieldId].label} must be a valid number.`
            );

            return false;

        }


        /* OUTSIDE RANGE */

        const rule =
            rules[fieldId];

        if (
            number < rule.min ||
            number > rule.max
        ) {

            showFieldError(
                fieldId,
                `${rule.label} must be between ${rule.min} and ${rule.max}.`
            );

            return false;

        }


        return true;

    }


    /* =========================================================
       VALIDATE SELECT
    ========================================================= */

    function validateSelect(
        fieldId,
        label
    ) {

        const field =
            document.getElementById(fieldId);

        if (!field) {

            return false;

        }

        clearFieldError(fieldId);

        if (field.value === "") {

            showFieldError(
                fieldId,
                `${label} is required.`
            );

            return false;

        }

        return true;

    }


    /* =========================================================
       LIVE VALIDATION
    ========================================================= */

    Object.keys(rules).forEach((fieldId) => {

        const field =
            document.getElementById(fieldId);

        if (!field) {

            return;

        }

        field.addEventListener(
            "input",
            () => {

                if (field.value.trim() !== "") {

                    validateNumber(fieldId);

                } else {

                    clearFieldError(fieldId);

                }

            }
        );

    });


    /* =========================================================
       SELECT LIVE VALIDATION
    ========================================================= */

    const selectFields = [

        {
            id: "sex",
            label: "Sex"
        },

        {
            id: "fbs",
            label: "Fasting Blood Sugar"
        },

        {
            id: "cp",
            label: "Chest Pain Type"
        },

        {
            id: "restecg",
            label: "Resting ECG"
        },

        {
            id: "exang",
            label: "Exercise Induced Angina"
        },

        {
            id: "slope",
            label: "ST Segment Slope"
        },

        {
            id: "ca",
            label: "Major Vessels (CA)"
        },

        {
            id: "thal",
            label: "Thalassemia"
        }

    ];


    selectFields.forEach(
        ({ id, label }) => {

            const field =
                document.getElementById(id);

            if (!field) {

                return;

            }

            field.addEventListener(
                "change",
                () => {

                    if (field.value !== "") {

                        clearFieldError(id);

                    }

                }
            );

        }
    );


    /* =========================================================
       FORM SUBMISSION
    ========================================================= */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            formError.classList.remove(
                "show"
            );

            formError.textContent = "";


            /* -----------------------------------------------
               VALIDATE NUMBERS
            ------------------------------------------------ */

            let valid = true;


            Object.keys(rules).forEach(
                (fieldId) => {

                    if (
                        !validateNumber(fieldId)
                    ) {

                        valid = false;

                    }

                }
            );


            /* -----------------------------------------------
               VALIDATE SELECTS
            ------------------------------------------------ */

            selectFields.forEach(
                ({ id, label }) => {

                    if (
                        !validateSelect(
                            id,
                            label
                        )
                    ) {

                        valid = false;

                    }

                }
            );


            /* -----------------------------------------------
               STOP IF INVALID
            ------------------------------------------------ */

            if (!valid) {

                formError.textContent =
                    "Please correct the highlighted fields before continuing.";

                formError.classList.add(
                    "show"
                );

                const firstError =
                    document.querySelector(
                        ".input-error"
                    );

                if (firstError) {

                    firstError.focus();

                }

                return;

            }


            /* -----------------------------------------------
               DISABLE BUTTON
            ------------------------------------------------ */

            submitButton.disabled = true;

            submitButton.textContent =
                "Assessing...";


            /* -----------------------------------------------
               CREATE PATIENT DATA
            ------------------------------------------------ */

            const patient = {

                age: Number(
                    document.getElementById(
                        "age"
                    ).value
                ),

                sex:
                    document.getElementById(
                        "sex"
                    ).value === "Male"
                        ? 1
                        : 0,

                sexLabel:
                    document.getElementById(
                        "sex"
                    ).value,

                cp: Number(
                    document.getElementById(
                        "cp"
                    ).value
                ),

                trestbps: Number(
                    document.getElementById(
                        "trestbps"
                    ).value
                ),

                chol: Number(
                    document.getElementById(
                        "chol"
                    ).value
                ),

                fbs: Number(
                    document.getElementById(
                        "fbs"
                    ).value
                ),

                restecg: Number(
                    document.getElementById(
                        "restecg"
                    ).value
                ),

                thalach: Number(
                    document.getElementById(
                        "thalach"
                    ).value
                ),

                exang: Number(
                    document.getElementById(
                        "exang"
                    ).value
                ),

                oldpeak: Number(
                    document.getElementById(
                        "oldpeak"
                    ).value
                ),

                slope: Number(
                    document.getElementById(
                        "slope"
                    ).value
                ),

                ca: Number(
                    document.getElementById(
                        "ca"
                    ).value
                ),

                thal: Number(
                    document.getElementById(
                        "thal"
                    ).value
                )

            };


            /* -----------------------------------------------
               SEND TO API
            ------------------------------------------------ */

            try {

                const response =
                    await fetch(
                        "/predict",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    patient
                                )

                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Prediction request failed."
                    );

                }


                const result =
                    await response.json();


                console.log(
                    "FULL API RESPONSE:",
                    result
                );


                /* -------------------------------------------
                   CHECK API RESPONSE
                -------------------------------------------- */

                if (result.error) {

                    throw new Error(
                        result.error
                    );

                }


                if (
                    result.success === false
                ) {

                    throw new Error(
                        result.error ||
                        "Prediction could not be completed."
                    );

                }


                /* -------------------------------------------
                   SAVE RESULT
                -------------------------------------------- */

                localStorage.setItem(
                    "heartPredictionResult",
                    JSON.stringify(result)
                );


                localStorage.setItem(
                    "heartPatientData",
                    JSON.stringify(patient)
                );


                /* -------------------------------------------
                   GO TO RESULT PAGE
                -------------------------------------------- */

                window.location.href =
                    "/result.html";


            }

            catch (error) {

                console.error(
                    "Prediction error:",
                    error
                );

                formError.textContent =
                    error.message ||
                    "Prediction could not be completed.";

                formError.classList.add(
                    "show"
                );

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Assess Heart Disease Risk";

            }

        }
    );

});