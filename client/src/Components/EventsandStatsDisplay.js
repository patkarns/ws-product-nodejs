import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

// Components
import DataSelection from './DataSelection';
import CategorySelection from './CategorySelection';
import TimeframeSelection from './TimeframeSelection';
import Chart from './Chart';

import axios from 'axios';
import moment from 'moment';

export default class EventsandStatsDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedData: 'stats',
            dayView: true,
            selectedCategories: {
                'impressions': true,
                'clicks': true,
                'revenue': true
            },
        };
        this.fetchData = this.fetchData.bind(this);
        this.handleDataSelection = this.handleDataSelection.bind(this);
        this.handleTimeframeToggle = this.handleTimeframeToggle.bind(this);
        this.handleCategorySelection = this.handleCategorySelection.bind(this);
    }

    async componentDidMount () {
       await this.fetchData();
    }

    async handleTimeframeToggle() {
        const dayView = !this.state.dayView;
        await this.setState({ ...this.state, dayView });
        await this.fetchData();
    }

    async fetchData() {
        const { state } = this;
        const res = await axios.get(`/server/${state.selectedData}/${state.dayView ? 'daily' : 'hourly'}`);
        // const res = await axios.get(`http://localhost:5555/${state.selectedData}/${state.dayView ? 'daily' : 'hourly'}`);
        const data = res.data
        if (state.dayView) {
            data.map((dataObject, index) => {
                const formattedDate = moment(dataObject.date).format("MMM DD YYYY");
                data[index].formattedDate = formattedDate;
                data[index].formattedUNIX = moment(dataObject.date).unix();
            });
        } else {
            data.map((dataObject, index) => {
                const dateTime = moment(dataObject.date).add(dataObject.hour, 'hours');
                const formattedDate = moment(dateTime).format("MMM DD YYYY hh A");
                data[index].formattedDate = formattedDate;
                data[index].formattedUNIX = moment(dataObject.date).unix();
            });
        }
        
        await this.setState({ ...this.state, data});
    }


    async handleDataSelection(selectedData) {
        await this.setState({ ...this.state, selectedData });
        await this.fetchData();
    }


    async handleCategorySelection(selectedCategory) {
        const { state } = this;

        const selectedCategories = { ...state.selectedCategories}
        selectedCategories[selectedCategory] = !selectedCategories[selectedCategory];
        await this.setState({ ...this.state, selectedCategories });
    }

    render() {
    
        const { state } = this;
        const statsMode = state.selectedData === 'stats';
 
        return (
            <div>
                <Grid container spacing={3}>
                <Grid item xs={2}>
                <Grid>
                <DataSelection 
                    selected={state.selectedData} selections={['events', 'stats', 'poi']} 
                    handleSelection={this.handleDataSelection}/>
                </Grid>
                <Grid>
                { (state.selectedData !== 'poi') && 
                    <TimeframeSelection
                        selected={state.dayView ? 'daily' : 'hourly'}
                        selections={['daily', 'hourly']}
                        handleTimeframeToggle={this.handleTimeframeToggle}
                    />
                }
                </Grid>
                
                { statsMode && 
                    <Grid> <CategorySelection
                        selectedCategories={state.selectedCategories}
                        handleSelection={this.handleCategorySelection}/> </Grid>
                }
                </Grid>
                <Grid item xs={10}>
                <Chart
                    data={state.data}
                    selectedData={state.selectedData}
                    selectedCategories={state.selectedCategories}
                />
        </Grid>
        </Grid>

            </div>
        )
    }
}