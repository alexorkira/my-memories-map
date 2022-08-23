// react
import { createContext, createRef, useEffect, useRef, useState } from 'react';

// openlayers
import TileLayer from 'ol/layer/Tile';
// import Tile from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { transform, useGeographic } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';

useGeographic();

export const MapContext = createContext(undefined);

const MapWrapper: React.FC<any> = (props?: { features?: any }) => {
    // set intial state

    const [ map, setMap ] = useState<any>();
    // const [ mapContext, setMapContext ] = useState<any>();
    const [ featuresLayer, setFeaturesLayer ] = useState<any>();
    const [ selectedCoord, setSelectedCoord ] = useState<any>();
    const mapDivRef = createRef<HTMLDivElement>();
    // pull refs
    //const mapElement = useRef(null);

    // const source = new VectorSource({
    //     url: 'data/data.geojson',
    //     format: new GeoJSON(),
    // });

    // const vectorLayer = new VectorLayer({
    //     source: source,
    //     style: {
    //         'fill-color': 'rgba(255, 255, 255, 0.6)',
    //         'stroke-width': 1,
    //         'stroke-color': '#319FD3',
    //         'circle-radius': 5,
    //         'circle-fill-color': 'rgba(255, 255, 255, 0.6)',
    //         'circle-stroke-width': 1,
    //         'circle-stroke-color': '#319FD3',
    //     },
    // });

    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef(null);
    mapRef.current = map;

    const home = [ 6.981, 43.5544 ]; // Long Lat
    //const place = [-110, 45];43,5544

    const point = new Point(home);

    useEffect( () => {
        const initalFeaturesLayer = new VectorLayer({
            source: new VectorSource()
        });

        // create map
        const initialMap = new Map({
            target: mapDivRef.current ?? undefined,
            layers: [
                // new Tile({ source: new OSM() }),
                // USGS Topo
                new TileLayer({
                    source: new XYZ({
                        //url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    })
                }),
                // Google Maps Terrain
                // new TileLayer({
                //     source: new XYZ({
                //         url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                //     })
                // }),
                new VectorLayer({
                    source: new VectorSource({
                        features: [new Feature(point)],
                    }),
                    style: {
                        'circle-radius': 9,
                        'circle-fill-color': 'red',
                    },
                }),
                initalFeaturesLayer

            ],
            view: new View({
                //projection: 'EPSG:4326', // WGS84 ? World Geodetic System 1984
                center: home,
                zoom: 6,
                // projection: new Projection({
                //     code: 'EPSG:3857',
                //     units: 'm'
                // })
            }),
            controls: []
        });

        //const view = initialMap.getView();
        // view.on('change:resolution', function(){
        //     console.log('change:resolution');// dosen't work
        // });
        // set map onclick handler
        initialMap.on('click', handleMapClick);

        setMap(initialMap);
        setFeaturesLayer(initalFeaturesLayer);
    }, []);

    // update map if features prop changes - logic formerly put into componentDidUpdate
    useEffect( () => {
        if (props?.features?.length) {
            // set features to map
            featuresLayer.setSource(
                new VectorSource({
                    features: props.features // make sure features is an array
                })
            );

            // fit map to feature extent (with 100px of padding)
            map.getView().fit(featuresLayer.getSource().getExtent(), {
                padding: [ 100, 100, 100, 100 ]
            });
        }
    }, [props?.features]);

    const handleMapClick = (event: any) => {
        console.log(event);
        // get clicked coordinate using mapRef 
        // to access current React state inside OpenLayers callback
        const clickedCoord = (mapRef.current as any)?.getCoordinateFromPixel(event.pixel);

        // transform coord to EPSG 4326 standard Lat Long
        const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326');

        // set React state
        setSelectedCoord(transormedCoord);
    };

    // const zoom = (lat: number, long: number) => {
    //     const actualZoom = map.getView().getZoom();
    //     console.log(actualZoom);

    //     map.setView(new View({
    //         projection: 'EPSG:4326',
    //         center: [ long, lat ],
    //         zoom: actualZoom
    //     }));
    // };

    return (
        <>
            {/* Working but display tow map !? */}
            {/* <div ref={mapDivRef} className="map-container"></div>
            <div className="clicked-coord-label">
                <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
            </div> */}
            <div className="map-container" ref={mapDivRef}>
                {map?.mapContext && (
                    <MapContext.Provider value={map.mapContext} />
                )}
            </div>
        </>
    );
};

export default MapWrapper;
