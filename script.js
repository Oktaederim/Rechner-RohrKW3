document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const volumeFlowSlider = document.getElementById('volumeFlow');
    const deltaTSlider = document.getElementById('deltaT');
    const diameterSlider = document.getElementById('diameter');

    const volumeFlowInput = document.getElementById('volumeFlowInput');
    const deltaTInput = document.getElementById('deltaTInput');
    const diameterInput = document.getElementById('diameterInput');

    const resetBtn = document.getElementById('resetBtn');

    // Input value displays
    const volumeFlowLpmValueEl = document.getElementById('volumeFlowLpmValue');
    const volumeFlowM3hValueEl = document.getElementById('volumeFlowM3hValue');
    const deltaTValueEl = document.getElementById('deltaTValue');
    const diameterValueEl = document.getElementById('diameterValue');
    const crossSectionValueEl = document.getElementById('crossSectionValue'); // NEU

    // Output displays
    const powerOutputEl = document.getElementById('powerOutput');
    const velocityOutputEl = document.getElementById('velocityOutput');
    const velocityBox = document.getElementById('velocityBox');

    // --- Constants ---
    const WATER_CONSTANT_KW_M3H = 1.163;
    const DEFAULT_VALUES = {
        volumeFlow: 10,
        deltaT: 10,
        diameter: 20
    };

    // --- Calculation Functions ---
    function calculatePower(volumeFlowM3h, deltaT) {
        return volumeFlowM3h * WATER_CONSTANT_KW_M3H * deltaT;
    }

    function calculateVelocity(volumeFlowM3h, diameterMm) {
        if (diameterMm <= 0) return 0;
        const radiusM = diameterMm / 2 / 1000;
        const areaM2 = Math.PI * Math.pow(radiusM, 2);
        const volumeFlowM3s = volumeFlowM3h / 3600;
        return volumeFlowM3s / areaM2;
    }

    // --- Main Update Function ---
    function updateAllOutputs() {
        const volumeFlowLpm = parseFloat(volumeFlowSlider.value) || 0;
        const deltaT = parseFloat(deltaTSlider.value) || 0;
        const diameterMm = parseFloat(diameterSlider.value) || 0;

        const volumeFlowM3h = volumeFlowLpm * 60 / 1000;
        const powerKw = calculatePower(volumeFlowM3h, deltaT);
        const velocityMs = calculateVelocity(volumeFlowM3h, diameterMm);

        // Berechnung der Querschnittsfläche
        const radiusM = diameterMm / 2 / 1000;
        const areaM2 = Math.PI * Math.pow(radiusM, 2);

        // Update der Anzeigen
        volumeFlowLpmValueEl.textContent = `${volumeFlowLpm.toFixed(1)} l/min`;
        volumeFlowM3hValueEl.textContent = `${volumeFlowM3h.toFixed(2)} m³/h`;
        deltaTValueEl.textContent = `${deltaT.toFixed(1)} °C`;
        diameterValueEl.textContent = `${diameterMm.toFixed(1)} mm`;
        crossSectionValueEl.textContent = `A = ${areaM2.toFixed(6)} m²`;

        powerOutputEl.textContent = powerKw.toFixed(2);
        velocityOutputEl.textContent = velocityMs.toFixed(2);
        updateVelocityIndicator(velocityMs);
    }

    function updateVelocityIndicator(velocityMs) {
        velocityBox.classList.remove('bg-green-100', 'bg-yellow-100', 'bg-red-100', 'bg-gray-50');
        const velocityText = velocityBox.querySelector('p:first-of-type');
        velocityText.classList.remove('text-green-600', 'text-yellow-600', 'text-red-600', 'text-gray-700');
        const velocityH3 = velocityBox.querySelector('h3');
        velocityH3.classList.remove('text-green-800', 'text-yellow-800', 'text-red-800');

        if (velocityMs >= 0.5 && velocityMs <= 1.0) {
            velocityBox.classList.add('bg-green-100');
            velocityText.classList.add('text-green-600');
            velocityH3.classList.add('text-green-800');
        } else if (velocityMs > 1.0 && velocityMs <= 1.5) {
            velocityBox.classList.add('bg-yellow-100');
            velocityText.classList.add('text-yellow-600');
            velocityH3.classList.add('text-yellow-800');
        } else if (velocityMs > 1.5) {
            velocityBox.classList.add('bg-red-100');
            velocityText.classList.add('text-red-600');
            velocityH3.classList.add('text-red-800');
        } else {
            velocityBox.classList.add('bg-gray-50');
            velocityText.classList.add('text-gray-700');
        }
    }
    
    // --- Event Listener Setup ---

    function sanitizeValue(value, min, max, step) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return min;
        const clampedValue = Math.max(min, Math.min(numValue, max));
        const roundedValue = Math.round(clampedValue / step) * step;
        return roundedValue;
    }

    function connectControls(inputElement, sliderElement) {
        sliderElement.addEventListener('input', () => {
            inputElement.value = sliderElement.value;
            updateAllOutputs();
        });
        inputElement.addEventListener('input', () => {
            const value = parseFloat(inputElement.value);
            if (!isNaN(value)) {
                sliderElement.value = value;
                updateAllOutputs();
            }
        });
        inputElement.addEventListener('blur', () => {
            const min = parseFloat(sliderElement.min);
            const max = parseFloat(sliderElement.max);
            const step = parseFloat(sliderElement.step);
            const sanitized = sanitizeValue(inputElement.value, min, max, step);
            inputElement.value = sanitized.toFixed(1);
            sliderElement.value = sanitized;
            updateAllOutputs();
        });
    }

    connectControls(volumeFlowInput, volumeFlowSlider);
    connectControls(deltaTInput, deltaTSlider);
    connectControls(diameterInput, diameterSlider);

    // --- Reset and Initialization ---
    function resetToDefaults() {
        volumeFlowSlider.value = DEFAULT_VALUES.volumeFlow;
        deltaTSlider.value = DEFAULT_VALUES.deltaT;
        diameterSlider.value = DEFAULT_VALUES.diameter;
        
        // Sync input fields with new slider values
        volumeFlowInput.value = DEFAULT_VALUES.volumeFlow.toFixed(1);
        deltaTInput.value = DEFAULT_VALUES.deltaT.toFixed(1);
        diameterInput.value = DEFAULT_VALUES.diameter.toFixed(1);
        
        updateAllOutputs();
    }

    resetBtn.addEventListener('click', resetToDefaults);

    // Initial Call on page load
    function initialize() {
        resetToDefaults();
    }
    
    initialize();
});
