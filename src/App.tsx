import './App.css';
import Mapgl from './Mapgl';
import { MapglContextProvider } from './MapglContext';
import ButtonRulerAddPreset from './ButtonRulerAddPreset';
import ButtonResetMapCenter from './ButtonResetMapCenter';
import ButtonRulerReset from './ButtonRulerReset';
import { useState } from 'react';

function App() {
    const [showAccidents, setShowAccidents] = useState(false);
    const [showHeatLayer, setShowHeatLayer] = useState(true);

    return (
        <MapglContextProvider>
            <div>
                <div className='App-buttons'>
                    <div className='App-button-item'>
                        <ButtonRulerAddPreset />
                    </div>
                    <div className='App-button-item'>
                        <ButtonRulerReset />
                    </div>
                    <div className='App-button-item'>
                        <ButtonResetMapCenter />
                    </div>
                </div>
                <div className='map-layers-controls'>
                    <div className='layer-control'>
                        <label>
                            <input
                                type="checkbox"
                                checked={showAccidents}
                                onChange={() =>  setShowAccidents(v => !v)}
                            />
                            Points
                        </label>
                    </div>
                    <div className='layer-control'>
                        <label>
                            <input
                            type="checkbox" 
                            checked={showHeatLayer}
                            onChange={() => setShowHeatLayer(v => !v)}
                            />
                            Heat Map
                        </label>
                    </div>
                </div>

                <div className='App-map-container'>
                    <Mapgl showAccidents={showAccidents} showHeatLayer={showHeatLayer} />
                </div>
            </div>
        </MapglContextProvider>
    );
}

export default App;
