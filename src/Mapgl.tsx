import { useEffect, useRef, useState } from 'react';
import { load } from '@2gis/mapgl';
import mapgl from '@2gis/mapgl/types';
import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from
    'geojson';
//import geoData from './data/tiumenskaia-oblast.json';

type MapglProps = {
    showAccidents: boolean;
    showHeatLayer: boolean;
};

export const MAP_CENTER = [65.533371, 57.152529];

export default function Mapgl({
    showAccidents,
    showHeatLayer,
}: MapglProps) {
    const { setMapglContext } = useMapglContext();
    const [geoData, setGeoData] = useState<
        FeatureCollection<Geometry, GeoJsonProperties> | null
    >(null);
    const [styleLoaded, setStyleLoaded] = useState(false);
    const mapRef = useRef<mapgl.Map | null>(null);

    const pointLayer = {
        id: 'dtp-data-layer', // ID каждого слоя должен быть уникальным
        // Фильтрация или выбор данных для этого слоя 
        filter: [
            'all',
            [
                'match',
                ['sourceAttr', 'visible'],
                [true],
                true, // Значение при совпадении атрибута 'visible' источника со значением 'true' 
                false, // Значение при несовпадении 
            ]
        ],
        // Тип объекта отрисовки 
        type: 'point',
        // Стиль объекта отрисовки 
        style: {
            iconImage: ['match', ['get', 'severity'],
                ['Легкий'], 'road-accident-slight', 'road-accident'],
            iconWidth: 20,
            textField: ['get', 'severity'],
            textFont: ['Noto_Sans'],
            textFontSize: 18,
            textColor: '#ffffff',
            iconPriority: 103,
            textPriority: 100,
        },
    };

    const heatLayer = {
        id: 'dtp-heatmap-layer', // ID каждого слоя должен быть уникальным
        // Фильтрация или выбор данных для этого слоя 
        filter: [
            'match',
            ['sourceAttr', 'visible'],
            [true],
            true, // Значение при совпадении атрибута 'purpose' источника со значением 'heatmap' 
            false, // Значение при несовпадении 
        ],
        // Тип объекта отрисовки 
        type: 'heatmap',
        // Стиль объекта отрисовки 
        style: {
            color: [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(0, 0, 0, 0)',
                0.2,
                'rgba(94, 69, 143, 1)',
                0.4,
                'rgba(28, 104, 149, 1)',
                0.6,
                'rgb(55, 165, 164)',
                0.8,
                'rgb(92, 255, 252)',
                1,
                'rgba(255, 255, 255, 1)',
            ],
            radius: 20,
            intensity: 0.8,
            opacity: 0.8,
            downscale: 1,
        },
    };

    useEffect(() => {
        async function loadData() {
            console.log();
            const response = await fetch('./mapGL-JS-API/data/tiumenskaia-oblast.json');
            const data = await response.json();

            setGeoData(data);
        }

        loadData();
    }, []);

    useEffect(() => {
        if (!geoData) return;
        let map: mapgl.Map | undefined = undefined;
        let directions: Directions | undefined = undefined;
        let clusterer: Clusterer | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 13,
                key: '6e2acca5-f055-4611-ae95-879ad77f276b',
                style: '71c58a1a-1c5c-4ca2-9b29-fd11166dbf1b',
            });

            mapRef.current = map;

            map.on('click', (e) => console.log(e));
            // map.on('load', () => {
            //     console.log(map.getStyle());
            // });

            /**
             * Ruler  plugin
             */

            const rulerControl = new RulerControl(map, { position: 'centerRight' });

            /**
             * Clusterer plugin
             */

            clusterer = new Clusterer(map, {
                radius: 60,
            });

            const markers = [
                { coordinates: [55.27887, 25.21001] },
                { coordinates: [55.30771, 25.20314] },
                { coordinates: [55.35266, 25.24382] },
            ];
            clusterer.load(markers);

            /**
             * Directions plugin
             */

            directions = new Directions(map, {
                directionsApiKey: 'rujany4131', // It's just demo key
            });

            directions.carRoute({
                points: [
                    [55.28273111108218, 25.234131928828333],
                    [55.35242563034581, 25.23925607042088],
                ],
            });




            const data: FeatureCollection<Geometry, GeoJsonProperties> =
                geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            const source = new mapgl.GeoJsonSource(map, {
                data,
                attributes: {
                    visible: true, // Уникальное свойство 
                },
            });

            // map.loadImage()

            

            // map.on('styleload', () => {
            //     map?.addLayer(heatLayer);
            // });

            // map.on('styleload', () => {
            //     map?.addLayer(pointLayer);
            // });

            map.on('styleload', () => {
                setStyleLoaded(true);
            });

            // if (showAccidents) {
            //     map.addLayer(pointLayer);
            // } else {
            //     map.removeLayer("dtp-data-layer");
            // }

            // if (showHeatLayer) {
            //     map.addLayer(heatLayer);
            // } else {
            //     map.removeLayer("dtp-heatmap-layer");
            // }

            setMapglContext({
                mapglInstance: map,
                rulerControl,
                mapgl,
            });
        });

        // Destroy the map, if Map component is going to be unmounted
        return () => {
            directions && directions.clear();
            clusterer && clusterer.destroy();
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext, geoData]);

    useEffect(() => {
        console.log(showAccidents, styleLoaded)
        const map = mapRef.current;

        if (!map || !styleLoaded) return;

        if (showAccidents) {
            map.addLayer(pointLayer);
        } else {
            map.removeLayer('dtp-data-layer');
        }
    }, [showAccidents, styleLoaded]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map || !styleLoaded) return;

        if (showHeatLayer) {
            map.addLayer(heatLayer);
        } else {
            map.removeLayer('dtp-heatmap-layer');
        }
    }, [showHeatLayer, styleLoaded]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}
