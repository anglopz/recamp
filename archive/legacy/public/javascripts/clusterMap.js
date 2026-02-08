// clusterMap.js - VERSIÓN MEJORADA CON CONFIGURACIÓN ROBUSTA

const MAP_CONFIG = {
    style: 'mapbox://styles/mapbox/outdoors-v12', // ← Cambiado a estilo más estable
    center: [-103.5917, 40.6699],
    zoom: 3,
    cluster: {
        maxZoom: 14,
        radius: 50
    },
    colors: {
        cluster: ['#51bbd6', '#f1f075', '#f28cb1'],
        point: '#11b4da',
        pointHover: '#0d6efd'
    }
};

class CampgroundMap {
    constructor() {
        this.init();
    }

    init() {
        this.loadConfig();
        this.initMap();
        this.setupMapEvents();
    }

    loadConfig() {
        try {
            const configElement = document.getElementById('map-config');
            if (!configElement) throw new Error('Map config not found');
            
            this.config = JSON.parse(configElement.textContent);
            if (!this.config.mapToken) throw new Error('Map token missing');
            
        } catch (error) {
            console.error('Failed to load map configuration:', error);
            return;
        }
    }

    initMap() {
        mapboxgl.accessToken = this.config.mapToken;
        
        // ✅ CONFIGURACIÓN ROBUSTA AÑADIDA AQUÍ
        this.map = new mapboxgl.Map({
            container: 'map',
            style: MAP_CONFIG.style,
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
            antialias: false,                    // ← Mejora performance
            attributionControl: true,
            failIfMajorPerformanceCaveat: false, // ← Permite cargar incluso en hardware limitado
            preserveDrawingBuffer: true,         // ← Mejora compatibilidad
            maxTileCacheSize: 50,               // ← Control de cache
            localIdeographFontFamily: false     // ← Mejora carga de fuentes
        });

        console.log('Mapbox GL JS version:', mapboxgl.version);
    }

    setupMapEvents() {
        // ✅ MANEJO MEJORADO DE ERRORES
        this.map.on('load', () => {
            console.log('Map loaded successfully');
            this.setupLayers();
        });
        
        this.map.on('error', (e) => {
            console.warn('Mapbox error:', e.error);
        });

        this.map.on('styledata', () => {
            console.log('Map style loaded');
        });

        this.map.on('sourcedata', (e) => {
            if (e.sourceId === 'campgrounds' && e.isSourceLoaded) {
                console.log('Campgrounds source loaded');
            }
        });
    }

    setupLayers() {
        this.addSource();
        this.addClusterLayers();
        this.addInteractions();
    }

    addSource() {
        this.map.addSource('campgrounds', {
            type: 'geojson',
            data: { features: this.config.campgrounds },
            cluster: true,
            clusterMaxZoom: MAP_CONFIG.cluster.maxZoom,
            clusterRadius: MAP_CONFIG.cluster.radius,
            promoteId: 'id' // ← AÑADIDO para mejor performance
        });
    }

    addClusterLayers() {
        // Clusters layer
        this.map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step', ['get', 'point_count'],
                    MAP_CONFIG.colors.cluster[0], 100,
                    MAP_CONFIG.colors.cluster[1], 750,
                    MAP_CONFIG.colors.cluster[2]
                ],
                'circle-radius': [
                    'step', ['get', 'point_count'],
                    20, 100, 30, 750, 40
                ],
                'circle-stroke-width': 0,
                'circle-stroke-color': '#ffffff',
                'circle-emissive-strength': 1
            }
        });

        // Cluster count layer
        this.map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        // Unclustered points
        this.map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': MAP_CONFIG.colors.point,
                'circle-radius': 6,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff',
                'circle-emissive-strength': 1
            }
        });
    }

    addInteractions() {
        this.addClusterClick();
        this.addPointClick();
        this.addHoverEffects();
    }

    addClusterClick() {
        this.map.on('click', 'clusters', (e) => this.handleClusterClick(e));
    }

    addPointClick() {
        this.map.on('click', 'unclustered-point', (e) => this.handlePointClick(e));
    }

    addHoverEffects() {
        // Hover effects para clusters
        this.map.on('mouseenter', 'clusters', () => {
            this.map.getCanvas().style.cursor = 'pointer';
            this.highlightCluster(true);
        });

        this.map.on('mouseleave', 'clusters', () => {
            this.map.getCanvas().style.cursor = '';
            this.highlightCluster(false);
        });

        // Hover effects para puntos individuales
        this.map.on('mouseenter', 'unclustered-point', () => {
            this.map.getCanvas().style.cursor = 'pointer';
            this.highlightPoint(true);
        });

        this.map.on('mouseleave', 'unclustered-point', () => {
            this.map.getCanvas().style.cursor = '';
            this.highlightPoint(false);
        });
    }

    highlightCluster(highlight) {
        if (highlight) {
            this.map.setPaintProperty('clusters', 'circle-stroke-width', 3);
            this.map.setPaintProperty('clusters', 'circle-stroke-color', '#ffffff');
            this.map.setPaintProperty('clusters', 'circle-radius', [
                'step', ['get', 'point_count'],
                22, 100, 32, 750, 42
            ]);
        } else {
            this.map.setPaintProperty('clusters', 'circle-stroke-width', 0);
            this.map.setPaintProperty('clusters', 'circle-radius', [
                'step', ['get', 'point_count'],
                20, 100, 30, 750, 40
            ]);
        }
    }

    highlightPoint(highlight) {
        if (highlight) {
            this.map.setPaintProperty('unclustered-point', 'circle-radius', 8);
            this.map.setPaintProperty('unclustered-point', 'circle-stroke-width', 2);
            this.map.setPaintProperty('unclustered-point', 'circle-color', MAP_CONFIG.colors.pointHover);
            this.map.setPaintProperty('unclustered-point', 'circle-stroke-color', '#ffffff');
        } else {
            this.map.setPaintProperty('unclustered-point', 'circle-radius', 6);
            this.map.setPaintProperty('unclustered-point', 'circle-stroke-width', 1);
            this.map.setPaintProperty('unclustered-point', 'circle-color', MAP_CONFIG.colors.point);
            this.map.setPaintProperty('unclustered-point', 'circle-stroke-color', '#ffffff');
        }
    }

    handleClusterClick(e) {
        const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        
        if (features.length === 0) return;

        const clusterId = features[0].properties.cluster_id;
        this.map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) {
                    console.error('Cluster expansion error:', err);
                    return;
                }
                this.map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    }

    handlePointClick(e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const popupHtml = e.features[0].properties.popUpMarkup;

        this.closeExistingPopups();

        new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px'
        })
        .setLngLat(coordinates)
        .setHTML(popupHtml)
        .addTo(this.map);
    }

    closeExistingPopups() {
        const popups = document.getElementsByClassName('mapboxgl-popup');
        if (popups.length) {
            popups[0].remove();
        }
    }
}

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CampgroundMap();
});