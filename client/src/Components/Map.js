import React from 'react';
import mapboxgl from 'mapbox-gl';

// Constants
import PopulationMarkerColors from './ColorConstants/PopulationMarkerColors';
import TempMarkerColors from './ColorConstants/TempMarkerColors'
import CloudsMarkerColors from './ColorConstants/CloudsMarkerColors';

// MUI Components, Styles
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Grid, Icon } from '@material-ui/core';
import './map.scss';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_ACCESS_TOKEN;


const populationLegendText = {
  'POP_DEFAULT': 'No data',
  'POP_10K': '0 to 9,999',
  'POP_100K': '10,000 to 499,999',
  'POP_500K': '10,000 to 499,999',
  'POP_1M': '500,000 to 999,999',
  'POP_5M': '1 Million to 4.99 Million',
  'POP_GT_5M': '5 Million or higher'
};

const temperatureLegendText = {
  'TEMP_DEFAULT': 'No data',
  'LEVEL_1': '-15 or lower',
  'LEVEL_2': '-15 to -0.99',
  'LEVEL_3': '0 to 9.99',
  'LEVEL_4': '10 to 19.99',
  'LEVEL_5': '20 to 29.99',
  'LEVEL_6': '30 or higher',
};

const cloudsLegendText = {
  'CLOUDS_DEFAULT': 'No data',
  'CLOUDS_20': '0 - 19.99%',
  'CLOUDS_40': '20 - 39.99%',
  'CLOUDS_60': '40 - 59.99%',
  'CLOUDS_80': '60 - 79.99%',
  'CLOUDS_100': '80 - 100%',
};

const options = {
  temperature: {
    name: 'Temperature',
    id: 'temperature',
    description: 'Temperature in Celcius',
    property: 'temperature'
  },
  clouds: {
    name: 'Clouds',
    id:'clouds',
    description: 'Clouds %',
    property: 'clouds'
  },
  population: {
    name: 'Population',
  id: 'population',
  description: 'Estimated total population',
  property: 'population'
  }
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: options.temperature
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { geoJSONData } = this.props; 

    // Create the map
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: geoJSONData.length ? geoJSONData[0].geometry.coordinates : [5, 34],
      zoom: 3
    });

    // Once the map is created, add the data and layers
    this.map.on('load', () => {
      this.map.addSource('pois', {
        type: 'geojson',
        data: {
            type: "FeatureCollection",
            features: this.props.geoJSONData
        },
        cluster: true,
        clusterMaxZoom: 6,
        clusterRadius: 50
      });

      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        }
      });

      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'pois',
        layout: {
          'text-field': '{name}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1]
        }
      });

      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-color': ['get', 'color'],
        }
      });
    });
  }

  async handleChange (event) {
    const optionName = event.target.value;

    await this.props.toggleMetricSelection(optionName)
    this.map.getSource('pois').setData({
      type: "FeatureCollection",
      features: this.props.geoJSONData
    });

    await this.setState({ ...this.state, active: options[optionName] })
  }

  render() {
    const { state } = this;

    const optionLabels = Object.keys(options).map((optionName, idx) => {
      return  <FormControlLabel key={idx} value={options[optionName].property} control={<Radio />} label={options[optionName].description} />
    })

    const populationLegend = Object.keys(PopulationMarkerColors).map(populationColorKey => {
      return (<Grid key={populationColorKey} container spacing={0}>
            <Grid item xs={2}/>
            <Grid item xs={2}>
              <Icon style={{ color: PopulationMarkerColors[populationColorKey] }}> circle </Icon>
            </Grid>
            <Grid item>
              <div>{populationLegendText[populationColorKey]}</div>
            </Grid>
      </Grid>)
      
    });

    const temperatureLegend = Object.keys(TempMarkerColors).map(temperatureColorKey => {
      return (<Grid key={temperatureColorKey} container spacing={0}>
        <Grid item xs={2}/>
        <Grid item xs={2}>
        <Icon style={{ color: TempMarkerColors[temperatureColorKey] }}> circle </Icon>
        </Grid>
        <Grid item>
          <div>{temperatureLegendText[temperatureColorKey]}</div>
        </Grid>
      </Grid>);
    });

    const cloudsLegend = Object.keys(CloudsMarkerColors).map(cloudColorKey => {
      return (<Grid key={cloudColorKey} container spacing={0}>
        <Grid item xs={2}/>
        <Grid item xs={2}>
        <Icon style={{ color: CloudsMarkerColors[cloudColorKey] }}> circle </Icon>
        </Grid>
        <Grid item>
          <div>{cloudsLegendText[cloudColorKey]}</div>
        </Grid>
      </Grid>);
    });

    return (
      <div className="map-container">
        <div ref={el => this.mapContainer = el} className="map" />
        <div className="control-panel">
          <FormControl component="fieldset">
            <FormLabel component="legend">Metrics</FormLabel>
            <RadioGroup aria-label="metrics" name="metric" value={state.active.property} onChange={this.handleChange}>
              {optionLabels}
            </RadioGroup>
          </FormControl>
          <div className="legend-label"> Legend: {state.active.description} </div>
          {(state.active.property === 'population') && populationLegend}
          {(state.active.property === 'temperature') && temperatureLegend}
          {(state.active.property === 'clouds') && cloudsLegend}        
      </div>
      </div>
    );
  }
}

export default Map;
