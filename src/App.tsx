
import 'ol/ol.css';
import React from 'react';
import MapWrapper from './components/Map';
// import './map.css';
import './App.scss';

export const MapContext = React.createContext(undefined);

function App() {
    return (
        <div className="App">
            <MapWrapper />
        </div>
    );
}

export default App;
