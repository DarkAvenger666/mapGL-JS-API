import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { Clusterer } from '@2gis/mapgl-clusterer';
import { RulerControl } from '@2gis/mapgl-ruler';
import { Directions } from '@2gis/mapgl-directions';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import { FeatureCollection, Geometry, GeoJsonProperties } from
    'geojson';
import geoData from './data/tiumenskaia-oblast.json';

export const MAP_CENTER = [65.533371, 57.152529];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
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

            

            map.on('click', (e) => console.log(e));
            map.on('load', () => {
                console.log(map.getStyle());
            });

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

            const layer = {
                id: 'dtp-data-layer1', // ID каждого слоя должен быть уникальным
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

            map.on('styleload', () => {
                map?.addLayer(layer);
            }); 

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
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}
