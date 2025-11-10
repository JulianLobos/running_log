document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const runForm = document.getElementById('runForm');
    const runHistoryBody = document.getElementById('runHistoryBody');
    const exportDataBtn = document.getElementById('exportData');
    const importDataInput = document.getElementById('importData');
    const editRunModal = new bootstrap.Modal(document.getElementById('editRunModal'));
    const editRunForm = document.getElementById('editRunForm');
    const filterStartDateInput = document.getElementById('filterStartDate');
    const filterEndDateInput = document.getElementById('filterEndDate');
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const paginationControls = document.getElementById('paginationControls');

    // Gráficos de Chart.js
    let distanceChart, paceChart, caloriesChart;

    // Datos de la aplicación
    let runs = [];

    // Variables de Paginación
    const runsPerPage = 10;
    let currentPage = 1;

    // Variables de Filtro
    let filterStartDate = null;
    let filterEndDate = null;

    // --- FUNCIONES PRINCIPALES ---

    /**
     * Carga las carreras desde localStorage y las renderiza.
     */
    function loadRuns() {
        const runsFromStorage = localStorage.getItem('runningLog');
        runs = runsFromStorage ? JSON.parse(runsFromStorage) : [];
        // Ordenar por fecha descendente, corrigiendo el problema de la zona horaria
        runs.sort((a, b) => new Date(b.date.replace(/-/g, '/')) - new Date(a.date.replace(/-/g, '/')));

        // Inicializar filtros de fecha por defecto (últimos 3 meses)
        filterEndDate = new Date();
        filterStartDate = new Date();
        filterStartDate.setMonth(filterStartDate.getMonth() - 3);

        filterStartDateInput.value = filterStartDate.toISOString().split('T')[0];
        filterEndDateInput.value = filterEndDate.toISOString().split('T')[0];
        
        renderUI();
    }

    /**
     * Guarda las carreras en localStorage.
     */
    function saveRuns() {
        localStorage.setItem('runningLog', JSON.stringify(runs));
    }

    /**
     * Renderiza la tabla de historial y los gráficos.
     */
    function renderUI() {
        renderRunHistory();
        renderCharts();
        renderTopRuns();
        renderPaginationControls();
    }

    /**
     * Renderiza la tabla con el historial de carreras.
     */
    function renderRunHistory() {
        runHistoryBody.innerHTML = '';

        // Aplicar filtro de fechas
        const filteredRuns = runs.filter(run => {
            const runDate = new Date(run.date.replace(/-/g, '/'));
            runDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            const start = new Date(filterStartDate.toISOString().split('T')[0].replace(/-/g, '/'));
            start.setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate.toISOString().split('T')[0].replace(/-/g, '/'));
            end.setHours(23, 59, 59, 999); // Normalizar a fin del día
            return runDate >= start && runDate <= end;
        });

        if (filteredRuns.length === 0) {
            runHistoryBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay carreras registradas para el período seleccionado.</td></tr>';
            return;
        }

        // Aplicar paginación
        const totalPages = Math.ceil(filteredRuns.length / runsPerPage);
        const startIndex = (currentPage - 1) * runsPerPage;
        const endIndex = startIndex + runsPerPage;
        const runsToDisplay = filteredRuns.slice(startIndex, endIndex);

        runsToDisplay.forEach(run => {
            const pace = calculatePace(run.distance, run.time);
            const feelingIcon = getFeelingIcon(run.feeling);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(run.date.replace(/-/g, '/')).toLocaleDateString()}</td>
                <td>${run.distance.toFixed(2)} km</td>
                <td>${run.time}</td>
                <td>${pace}</td>
                <td>${run.calories || 'N/A'}</td>
                <td>${run.type}</td>
                <td title="${getFeelingText(run.feeling)}">${feelingIcon}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-run" data-id="${run.id}" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-run" data-id="${run.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            runHistoryBody.appendChild(row);
        });
    }

    /**
     * Renderiza o actualiza los gráficos de Chart.js.
     */
    function renderCharts() {
        // Aplicar filtro de fechas a los datos para los gráficos
        const filteredRuns = runs.filter(run => {
            const runDate = new Date(run.date.replace(/-/g, '/'));
            runDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            const start = new Date(filterStartDate.toISOString().split('T')[0].replace(/-/g, '/'));
            start.setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate.toISOString().split('T')[0].replace(/-/g, '/'));
            end.setHours(23, 59, 59, 999); // Normalizar a fin del día
            return runDate >= start && runDate <= end;
        });

        const labels = filteredRuns.map(run => new Date(run.date.replace(/-/g, '/')).toLocaleDateString()).reverse();
        const distanceData = filteredRuns.map(run => run.distance).reverse();
        const paceData = filteredRuns.map(run => {
            const [mins, secs] = calculatePace(run.distance, run.time).split(':').map(Number);
            return mins + secs / 60;
        }).reverse();

        // Configuración común de gráficos
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true }
            },
            plugins: { legend: { display: false } }
        };

        // Gráfico de Distancia
        if (distanceChart) distanceChart.destroy();
        distanceChart = new Chart(document.getElementById('distanceChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Distancia (km)',
                    data: distanceData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Distancia por Carrera' } } }
        });

        // Gráfico de Ritmo
        if (paceChart) paceChart.destroy();
        paceChart = new Chart(document.getElementById('paceChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Ritmo (min/km)',
                    data: paceData,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Ritmo por Carrera' } } }
        });

        // Gráfico de Calorías
        const caloriesData = filteredRuns.map(run => run.calories).reverse();
        if (caloriesChart) caloriesChart.destroy();
        caloriesChart = new Chart(document.getElementById('caloriesChart'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Calorías Quemadas (kcal)',
                    data: caloriesData,
                    backgroundColor: '#ffc107', // Color amarillo de Bootstrap
                    borderColor: '#e0a800',
                    borderWidth: 1
                }]
            },
            options: { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Calorías Quemadas por Carrera' } } }
        });
    }


    // --- FUNCIONES AUXILIARES ---

    /**
     * Calcula el ritmo en formato MM:SS por km.
     * @param {number} distance - Distancia en km.
     * @param {string} time - Tiempo en formato HH:MM:SS.
     * @returns {string} Ritmo en formato MM:SS.
     */
    function calculatePace(distance, time) {
        if (distance <= 0) return '00:00';
        const timeParts = time.split(':').map(Number);
        const totalSeconds = (timeParts[0] * 3600) + (timeParts[1] * 60) + timeParts[2];
        const secondsPerKm = totalSeconds / distance;
        const minutes = Math.floor(secondsPerKm / 60);
        const seconds = Math.round(secondsPerKm % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Devuelve un icono de emoji según la sensación.
     * @param {string} feeling - Valor de la sensación (1 a 5).
     * @returns {string} Emoji.
     */
    function getFeelingIcon(feeling) {
        const icons = { '5': '🤩', '4': '😊', '3': '🙂', '2': '😟', '1': '🤢' };
        return icons[feeling] || '-';
    }
    
    /**
     * Devuelve el texto descriptivo de la sensación.
     * @param {string} feeling - Valor de la sensación (1 a 5).
     * @returns {string} Texto descriptivo.
     */
    function getFeelingText(feeling) {
        const text = { '5': 'Excelente', '4': 'Buena', '3': 'Normal', '2': 'Regular', '1': 'Mala' };
        return text[feeling] || 'Sin datos';
    }

    /**
     * Renderiza la lista de las 5 carreras con mayor distancia.
     */
    function renderTopRuns() {
        const topRunsList = document.getElementById('topRunsList');
        topRunsList.innerHTML = ''; // Limpiar lista anterior

        // Aplicar filtro de fechas
        const filteredRuns = runs.filter(run => {
            const runDate = new Date(run.date.replace(/-/g, '/'));
            runDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            const start = new Date(filterStartDate.toISOString().split('T')[0].replace(/-/g, '/'));
            start.setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate.toISOString().split('T')[0].replace(/-/g, '/'));
            end.setHours(23, 59, 59, 999); // Normalizar a fin del día
            return runDate >= start && runDate <= end;
        });

        if (filteredRuns.length === 0) {
            topRunsList.innerHTML = '<li class="list-group-item text-center">No hay carreras registradas para el período seleccionado.</li>';
            return;
        }

        const sortedRuns = [...filteredRuns].sort((a, b) => b.distance - a.distance);
        const top5Runs = sortedRuns.slice(0, 5);

        top5Runs.forEach(run => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span>${new Date(run.date.replace(/-/g, '/')).toLocaleDateString()} - ${run.distance.toFixed(2)} km</span>
                <span class="badge bg-primary rounded-pill">${run.calories} kcal</span>
            `;
            topRunsList.appendChild(listItem);
        });
    }


    function renderPaginationControls() {
        paginationControls.innerHTML = ''; // Limpiar controles anteriores

        // Aplicar filtro de fechas para calcular el total de páginas
        const filteredRuns = runs.filter(run => {
            const runDate = new Date(run.date.replace(/-/g, '/'));
            runDate.setHours(0, 0, 0, 0);
            const start = new Date(filterStartDate.toISOString().split('T')[0].replace(/-/g, '/'));
            start.setHours(0, 0, 0, 0);
            const end = new Date(filterEndDate.toISOString().split('T')[0].replace(/-/g, '/'));
            end.setHours(23, 59, 59, 999);
            return runDate >= start && runDate <= end;
        });

        const totalPages = Math.ceil(filteredRuns.length / runsPerPage);

        if (totalPages <= 1) return; // No mostrar paginación si solo hay una página

        const ul = document.createElement('ul');
        ul.className = 'pagination';

        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderUI();
            }
        });
        ul.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderUI();
            });
            ul.appendChild(pageLi);
        }

        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderUI();
            }
        });
        ul.appendChild(nextLi);

        paginationControls.appendChild(ul);
    }


    // --- MANEJADORES DE EVENTOS ---

    applyFilterBtn.addEventListener('click', () => {
        filterStartDate = new Date(filterStartDateInput.value.replace(/-/g, '/'));
        filterEndDate = new Date(filterEndDateInput.value.replace(/-/g, '/'));
        currentPage = 1; // Resetear a la primera página al aplicar un nuevo filtro
        renderUI();
    });
    function openEditModal(runId) {
        const runToEdit = runs.find(run => run.id === runId);
        if (!runToEdit) return;

        document.getElementById('editRunId').value = runToEdit.id;
        document.getElementById('editRunDate').value = runToEdit.date;
        document.getElementById('editRunDistance').value = runToEdit.distance;
        document.getElementById('editRunTime').value = runToEdit.time;
        document.getElementById('editRunCalories').value = runToEdit.calories;
        document.getElementById('editRunType').value = runToEdit.type;
        document.getElementById('editRunFeeling').value = runToEdit.feeling;
        document.getElementById('editRunNotes').value = runToEdit.notes;

        editRunModal.show();
    }

    /**
     * Maneja el envío del formulario para añadir una nueva carrera.
     */
    runForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newRun = {
            id: Date.now(),
            date: document.getElementById('runDate').value,
            distance: parseFloat(document.getElementById('runDistance').value),
            time: document.getElementById('runTime').value,
            calories: parseInt(document.getElementById('runCalories').value, 10) || 0,
            type: document.getElementById('runType').value,
            feeling: document.getElementById('runFeeling').value,
            notes: document.getElementById('runNotes').value,
        };

        // Validación simple
        if (!newRun.date || !newRun.distance || !newRun.time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            alert('Por favor, completa la fecha, distancia y tiempo (formato HH:MM:SS) correctamente.');
            return;
        }

        runs.push(newRun);
        runs.sort((a, b) => new Date(b.date.replace(/-/g, '/')) - new Date(a.date.replace(/-/g, '/'))); // Re-ordenar
        saveRuns();
        renderUI();
        runForm.reset();
        document.getElementById('runDate').valueAsDate = new Date(); // Poner fecha actual por defecto
    });

    /**
     * Maneja el envío del formulario de edición.
     */
    editRunForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const runId = parseInt(document.getElementById('editRunId').value);
        const runIndex = runs.findIndex(run => run.id === runId);
        if (runIndex === -1) return;

        const updatedRun = {
            id: runId,
            date: document.getElementById('editRunDate').value,
            distance: parseFloat(document.getElementById('editRunDistance').value),
            time: document.getElementById('editRunTime').value,
            calories: parseInt(document.getElementById('editRunCalories').value, 10) || 0,
            type: document.getElementById('editRunType').value,
            feeling: document.getElementById('editRunFeeling').value,
            notes: document.getElementById('editRunNotes').value,
        };

        if (!updatedRun.date || !updatedRun.distance || !updatedRun.time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            alert('Por favor, completa la fecha, distancia y tiempo (formato HH:MM:SS) correctamente.');
            return;
        }

        runs[runIndex] = updatedRun;
        runs.sort((a, b) => new Date(b.date.replace(/-/g, '/')) - new Date(a.date.replace(/-/g, '/')));
        
        saveRuns();
        renderUI();
        editRunModal.hide();
    });

    /**
     * Maneja el clic en los botones de la tabla (editar y borrar).
     */
    runHistoryBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-run');
        if (editButton) {
            const runId = parseInt(editButton.dataset.id);
            openEditModal(runId);
            return;
        }

        const deleteButton = e.target.closest('.delete-run');
        if (deleteButton) {
            const runId = parseInt(deleteButton.dataset.id);
            if (confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
                runs = runs.filter(run => run.id !== runId);
                saveRuns();
                renderUI();
            }
        }
    });

    /**
     * Exporta los datos de las carreras a un archivo JSON.
     */
    exportDataBtn.addEventListener('click', () => {
        if (runs.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        const dataStr = JSON.stringify(runs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `running_log_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    /**
     * Importa datos desde un archivo JSON.
     */
    importDataInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (confirm('Esto sobreescribirá todos los datos actuales. ¿Estás seguro?')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedRuns = JSON.parse(event.target.result);
                    if (Array.isArray(importedRuns)) {
                        runs = importedRuns;
                        // Corregir el ordenamiento para evitar problemas de zona horaria
                        runs.sort((a, b) => new Date(b.date.replace(/-/g, '/')) - new Date(a.date.replace(/-/g, '/')));
                        saveRuns();
                        renderUI();
                        alert('¡Datos importados con éxito!');
                    } else {
                        throw new Error('El formato del JSON no es válido.');
                    }
                } catch (error) {
                    alert(`Error al importar el archivo: ${error.message}`);
                } finally {
                    // Resetear el input para poder cargar el mismo archivo de nuevo
                    importDataInput.value = '';
                }
            };
            reader.readAsText(file);
        }
    });

    // --- INICIALIZACIÓN ---
    loadRuns();
    document.getElementById('runDate').valueAsDate = new Date(); // Poner fecha actual por defecto
});
