// Archivo: js-vivi/vertice-lazy-load.js
// Sistema de lazy loading con scroll infinito para vertice.html
// Carga las secciones progresivamente para mejorar el tiempo de carga inicial

(function() {
    'use strict';

    // Configuración
    const config = {
        threshold: 800, // Píxeles antes del final para activar la carga
        debounceDelay: 150 // Delay para el scroll event
    };

    // Estado
    let currentSectionIndex = 0;
    let isLoading = false;
    let allSectionsLoaded = false;
    let scrollTimeout = null;

    // Orden de las secciones a cargar
    const sectionsOrder = [
        'template-what-we-do',
        'template-torn-paper',
        'template-why-vertice',
        'template-press',
        'template-final-cta'
    ];

    const container = document.getElementById('lazy-sections-container');

    if (!container) {
        console.error('[vertice-lazy-load] Contenedor no encontrado');
        return;
    }

    // Función para cargar la siguiente sección
    function loadNextSection() {
        if (isLoading || allSectionsLoaded) return;

        if (currentSectionIndex >= sectionsOrder.length) {
            allSectionsLoaded = true;
            console.log('[vertice-lazy-load] ✓ Todas las secciones cargadas');
            return;
        }

        isLoading = true;
        const templateId = sectionsOrder[currentSectionIndex];
        const template = document.getElementById(templateId);

        if (!template) {
            console.warn(`[vertice-lazy-load] Template no encontrado: ${templateId}`);
            currentSectionIndex++;
            isLoading = false;
            loadNextSection();
            return;
        }

        console.log(`[vertice-lazy-load] Cargando sección ${currentSectionIndex + 1}/${sectionsOrder.length}: ${templateId}`);

        // Clonar el contenido del template
        const clone = template.content.cloneNode(true);
        const section = clone.querySelector('.lazy-section');

        if (section) {
            // Añadir clase para animación de fade-in
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }

        // Agregar al contenedor
        container.appendChild(clone);

        // Animar entrada después de un pequeño delay
        setTimeout(() => {
            if (section) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        }, 50);

        // Optimizar carga de imágenes con lazy loading nativo
        const images = container.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
        });

        currentSectionIndex++;
        isLoading = false;

        // Si hay más secciones, preparar para cargar la siguiente
        if (currentSectionIndex < sectionsOrder.length) {
            // Pequeño delay para no sobrecargar
            setTimeout(() => {
                checkScrollPosition();
            }, 100);
        } else {
            allSectionsLoaded = true;
        }
    }

    // Función para verificar la posición del scroll
    function checkScrollPosition() {
        if (allSectionsLoaded) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const distanceFromBottom = pageHeight - scrollPosition;

        // Si estamos cerca del final, cargar la siguiente sección
        if (distanceFromBottom < config.threshold) {
            loadNextSection();
        }
    }

    // Event listener para scroll con debounce
    function handleScroll() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
            checkScrollPosition();
        }, config.debounceDelay);
    }

    // Event listener para resize (por si cambia el viewport)
    function handleResize() {
        checkScrollPosition();
    }

    // Inicialización
    function init() {
        console.log('[vertice-lazy-load] Inicializando lazy loading...');
        
        // Cargar la primera sección inmediatamente
        loadNextSection();

        // Agregar event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        // Verificar posición inicial (por si la ventana es muy grande)
        setTimeout(checkScrollPosition, 300);
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exponer función para forzar carga (útil para debugging)
    window.verticeForceLoadAll = function() {
        while (currentSectionIndex < sectionsOrder.length) {
            loadNextSection();
        }
    };

})();
