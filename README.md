# 🏃 Running Log Dashboard

Una aplicación web sencilla y local para registrar y visualizar tus carreras y entrenamientos. Permite llevar un control de tus actividades, analizar tu progreso con gráficos interactivos y gestionar tus datos de forma fácil.

## ✨ Características

*   **Registro de Carreras:** Añade nuevas carreras con fecha, distancia, tiempo, calorías quemadas, tipo de carrera, sensaciones y notas.
*   **Historial Detallado:** Visualiza todas tus carreras en una tabla paginada.
*   **Edición de Registros:** Modifica cualquier carrera existente a través de un modal intuitivo.
*   **Gráficos Interactivos:**
    *   **Distancia por Carrera:** Gráfico de línea que muestra la evolución de tus distancias.
    *   **Ritmo por Carrera:** Gráfico de línea para observar la mejora de tu ritmo.
    *   **Calorías Quemadas:** Gráfico de barras para visualizar el consumo calórico por entrenamiento.
*   **Filtro por Fechas:** Filtra los datos mostrados en gráficos y tablas por un rango de fechas específico. Por defecto, muestra los últimos 3 meses.
*   **Paginación:** Navega cómodamente por el historial de carreras, mostrando un número limitado de registros por página.
*   **Top 5 Carreras:** Una sección dedicada a mostrar tus 5 carreras con mayor distancia.
*   **Gestión de Datos:**
    *   **Exportar:** Descarga todos tus registros en formato JSON.
    *   **Importar:** Carga registros desde un archivo JSON, con opción de sobrescribir los datos existentes.
*   **Diseño Responsivo:** Interfaz amigable y adaptable a diferentes tamaños de pantalla, gracias a Bootstrap.

## 🛠️ Tecnologías Utilizadas

*   **HTML5:** Estructura de la página.
*   **CSS3:** Estilos personalizados.
*   **JavaScript (ES6+):** Lógica de la aplicación.
*   **Bootstrap 5:** Framework CSS para un diseño moderno y responsivo.
*   **Bootstrap Icons:** Iconos para mejorar la interfaz de usuario.
*   **Chart.js:** Librería para la creación de gráficos interactivos.

## 🚀 Cómo Usar

1.  **Descarga o Clona el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd running-log
    ```
    (Si no tienes Git, simplemente descarga el archivo ZIP y descomprímelo).

2.  **Abre `index.html`:**
    Dado que es una aplicación local, simplemente abre el archivo `index.html` en tu navegador web preferido (Chrome, Firefox, Edge, etc.). No necesitas un servidor web.

3.  **Añadir una Carrera:**
    *   Utiliza el formulario en la columna izquierda para introducir los detalles de tu carrera.
    *   Asegúrate de que el formato de tiempo sea `HH:MM:SS`.
    *   Haz clic en "Guardar Carrera".

4.  **Filtrar Datos:**
    *   En la sección "Filtros" (columna izquierda), selecciona una "Fecha Inicio" y una "Fecha Fin".
    *   Haz clic en "Aplicar Filtro" para actualizar los gráficos, el historial y el top 5 de carreras según el rango de fechas.
    *   Por defecto, los filtros mostrarán los datos de los últimos 3 meses.

5.  **Navegar por el Historial:**
    *   Utiliza los controles de paginación debajo de la tabla de historial para moverte entre las diferentes páginas de registros.

6.  **Editar una Carrera:**
    *   En la tabla de historial, haz clic en el botón con el icono de lápiz (<i class="bi bi-pencil"></i>) en la fila de la carrera que deseas editar.
    *   Se abrirá un modal con los datos precargados. Modifica los campos necesarios y haz clic en "Guardar Cambios".

7.  **Eliminar una Carrera:**
    *   En la tabla de historial, haz clic en el botón con el icono de papelera (<i class="bi bi-trash"></i>) en la fila de la carrera que deseas eliminar.
    *   Confirma la acción en el cuadro de diálogo.

8.  **Importar/Exportar Datos:**
    *   **Exportar:** Haz clic en "Exportar Datos (JSON)" para descargar un archivo `running_log_YYYY-MM-DD.json` con todos tus registros.
    *   **Importar:** Haz clic en "Importar Datos (JSON)", selecciona un archivo JSON compatible y confirma para cargar los datos en la aplicación. **¡Advertencia: esto sobrescribirá tus datos actuales!**

## 💡 Posibles Mejoras Futuras

*   **Cálculo Automático de Calorías:** Integrar una fórmula o API para estimar las calorías quemadas basándose en el peso del usuario, distancia y ritmo.
*   **Más Métricas:** Añadir campos para altitud, frecuencia cardíaca, etc.
*   **Gráficos Adicionales:** Gráficos de distribución por tipo de carrera, promedio de ritmo/distancia mensual, etc.
*   **Personalización:** Permitir al usuario elegir unidades (km/millas), temas de color.
*   **Almacenamiento en la Nube:** Opción de sincronizar datos con un servicio en la nube (requeriría un backend).

---

¡Disfruta registrando tus carreras! Si tienes alguna sugerencia o encuentras algún problema, no dudes en reportarlo.
