import React, { Component } from 'react';

import PopulationMarkerColors from './ColorConstants/PopulationMarkerColors';
import TempMarkerColors from './ColorConstants/TempMarkerColors';
import CloudsMarkerColors from './ColorConstants/CloudsMarkerColors'; 

// Components
import Map from './Map';

import axios from 'axios';
import reverse from 'reverse-geocode';

const cities_info = require('../Data/cities_info.json');

const OPEN_WEATHER_MAP_API_KEY = process.env.REACT_APP_OPEN_WEATHER_MAP_API_KEY;

export default class MapDisp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            geoJSONData: [],
            elevationColors: [],
            isLoading: false,
        };
        this.fetchData = this.fetchData.bind(this);
        this.getPopulationMarkerColors = this.getPopulationMarkerColors.bind(this);
        this.getWeatherMarkerColors = this.getWeatherMarkerColors.bind(this);
        this.toggleMetricSelection = this.toggleMetricSelection.bind(this);
    }

    async componentDidMount () {
       await this.fetchData();
    }

    async fetchData() {
        await this.setState({ ...this.state, isLoading: true });
        const endPoint = `api/poi`;
        // let endPoint = `http://localhost:5555/poi`;

        const res = await axios.get(endPoint);
        const geoJSONData = [];
        const data = res.data;
        
        const citiesDataRes = [];
        const fetchWeatherDataPromises = [];
        
        data.map((dataObject, index) => {
            data[index].id = dataObject.poi_id;
            const geoJSONObject = {
                type: 'Feature',
                properties: {
                    name: dataObject.name,
                    id: dataObject.poi_id,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [dataObject.lon, dataObject.lat]
                }
            };
            geoJSONData.push(geoJSONObject); 
            citiesDataRes.push(reverse.lookup(dataObject.lat, dataObject.lon, 'ca'))
            const endPoint = `http://api.openweathermap.org/data/2.5/weather?lat=${dataObject.lat}&lon=${dataObject.lon}&appid=${OPEN_WEATHER_MAP_API_KEY}&units=metric`;
            fetchWeatherDataPromises.push(axios.get(endPoint));
        });
          
        const cityMarkerColors = this.getPopulationMarkerColors(citiesDataRes);

        const weatherDataRes = await Promise.all(fetchWeatherDataPromises);
        const { tempMarkerColors, cloudMarkerColors } = this.getWeatherMarkerColors(weatherDataRes);      

        await this.setState({ ...this.state, data, geoJSONData, cityMarkerColors, cloudMarkerColors, tempMarkerColors });       
        await this.toggleMetricSelection('temperature');
        await this.setState({ isLoading: false });     
    }

    getPopulationMarkerColors(citiesDataRes) {
        return citiesDataRes.map(locationObj => {
            const city = locationObj.city;
            if (!city.length) return PopulationMarkerColors.POP_DEFAULT;
            const cityObj = cities_info[city];
            if (!cityObj) return PopulationMarkerColors.POP_DEFAULT;
            const population = cityObj.population;
            if (population < 10000) return PopulationMarkerColors.POP_10K;
            else if (population < 100000) return PopulationMarkerColors.POP_100K;
            else if (population < 500000) return PopulationMarkerColors.POP_500K;
            else if (population < 1000000) return PopulationMarkerColors.POP_1M;
            else if (population < 5000000) return PopulationMarkerColors.POP_5M;
            else return PopulationMarkerColors.POP_GT_5M;
        }); 
    }

    getWeatherMarkerColors(weatherDataRes) {
        const tempMarkerColors = [];
        const cloudMarkerColors = [];
        weatherDataRes.map(weatherDataResObj => {
            const temp = weatherDataResObj.data.main.temp;
            if (!temp || temp > 100) tempMarkerColors.push(TempMarkerColors.TEMP_DEFAULT);
            else if (temp < -15) tempMarkerColors.push(TempMarkerColors.LEVEL_1);
            else if (temp < 0) tempMarkerColors.push(TempMarkerColors.LEVEL_2);
            else if (temp < 10) tempMarkerColors.push(TempMarkerColors.LEVEL_3);
            else if (temp < 20) tempMarkerColors.push(TempMarkerColors.LEVEL_4);
            else if (temp < 30) tempMarkerColors.push(TempMarkerColors.LEVEL_5);
            else tempMarkerColors.push(tempMarkerColors.LEVEL_6);

            const cloudsPercent = weatherDataResObj.data.clouds.all;
            if (!cloudsPercent || (cloudsPercent < 0) || (cloudsPercent > 100)) cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_DEFAULT);
            else if (cloudsPercent < 20) cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_20);
            else if (cloudsPercent < 40) cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_40);
            else if (cloudsPercent < 60) cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_60);
            else if (cloudsPercent < 80) cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_80);
            else cloudMarkerColors.push(CloudsMarkerColors.CLOUDS_1000);
        });

        return { tempMarkerColors, cloudMarkerColors };
    }

    async toggleMetricSelection(metric) {
        const geoJSONData = [... this.state.geoJSONData];
        if (metric === 'temperature') {
            geoJSONData.map((geoJSONObj, idx) => {
                geoJSONObj.properties.color = this.state.tempMarkerColors[idx]
            });
        } else if (metric === 'clouds') {
            geoJSONData.map((geoJSONObj, idx) => {
                geoJSONObj.properties.color = this.state.cloudMarkerColors[idx];
            });
        } else {
            geoJSONData.map((geoJSONObj, idx) => {
                geoJSONObj.properties.color = this.state.cityMarkerColors[idx];
            });
        }
        await this.setState({ ...this.state, geoJSONData });
    }

    render() {
        const { state } = this;

        return (
            <React.Fragment>
                {!state.isLoading && <Map
                    geoJSONData={state.geoJSONData}
                    geoJSONFeatureCollection={state.geoJSONFeatureCollection}
                    data={state.data}
                    toggleMetricSelection={this.toggleMetricSelection}
                />}

            </React.Fragment>
        )
    }
}