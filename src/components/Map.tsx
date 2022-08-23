// react
import { createContext, createRef, useEffect, useRef, useState } from 'react';

// openlayers
import { toStringXY } from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';

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

    // create state ref that can be accessed in OpenLayers onclick callback function
    //  https://stackoverflow.com/a/60643670
    const mapRef = useRef(null);
    //mapRef.current = map;

    // initialize map on first render - logic formerly put into componentDidMount
    useEffect( () => {
    // create and add vector source layer
        if (map === undefined) {
            console.log('why does it disply two maps??');
            const initalFeaturesLayer = new VectorLayer({
                source: new VectorSource()
            });
                // create map
            const initialMap = new Map({
                target: mapDivRef.current ?? '',
                layers: [

                    // USGS Topo
                    new TileLayer({
                        source: new XYZ({
                            //url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        })
                    }),

                    // Google Maps Terrain
                    /* new TileLayer({
                        source: new XYZ({
                            url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                        })
                        }), */

                    initalFeaturesLayer

                ],
                view: new View({
                    center: [ 0, 0 ],
                    zoom: 3,
                }),
                // view: new View({
                //     projection: 'EPSG:3857',
                //     center: [ 0, 0 ],
                //     zoom: 2
                // }),
                controls: []
            });

            // set map onclick handler
            initialMap.on('click', handleMapClick);

            // save map and vector layer references to state
            setMap(initialMap);

            setFeaturesLayer(initalFeaturesLayer);
        }

        //const mapContext = { map };
    }, []);

    // update map if features prop changes - logic formerly put into componentDidUpdate
    useEffect( () => {
        if (props?.features?.length) { // may be null on first render
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

    // map click handler
    const handleMapClick = (event: any) => {
        console.log(event);
        // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
        const clickedCoord = (mapRef.current as any)?.getCoordinateFromPixel(event.pixel);

        // transform coord to EPSG 4326 standard Lat Long
        const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326');

        // set React state
        setSelectedCoord(transormedCoord);
    };

    // render component
    return (
        <>
            {/* Working but display tow map !? */}
            <div ref={mapDivRef} className="map-container"></div>
            <div className="clicked-coord-label">
                <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
            </div>
            {/* <div className="map-container" ref={mapDivRef}>
                {map?.mapContext && (
                    <MapContext.Provider value={map.mapContext}>
                        {/* <VectorLayer />
                    </MapContext.Provider>
                )} 
            </div>*/}
        </>
    );
};

export default MapWrapper;
