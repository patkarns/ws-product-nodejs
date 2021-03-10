import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

// Components
import DataSelection from './DataSelection';
import TimeframeSelection from './TimeframeSelection';
import DataTable from './DataTable';

import axios from 'axios';
import moment from 'moment';

export default class TableDisp extends Component {
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
        let endPoint = `http://localhost:5555/${state.selectedData}`;
        if (state.selectedData !== 'poi') endPoint = `${endPoint}/${state.dayView ? 'daily' : 'hourly'}`;

        const res = await axios.get(endPoint);
        const data = res.data
        if (state.dayView && (state.selectedData !== 'poi')) {
            data.map((dataObject, index) => {
                data[index].id = index;
                const formattedDate = moment(dataObject.date).format("MMM D YYYY");
                data[index].formattedDate = formattedDate;
                data[index].formattedUNIX = moment(dataObject.date).unix();
                if (state.selectedData === 'stats') data[index].revenue = Math.round(data[index].revenue * 100) / 100;
            });
        } else if (state.selectedData !== 'poi') {
            data.map((dataObject, index) => {
                data[index].id = index;
                const dateTime = moment(dataObject.date).add(dataObject.hour, 'hours');
                const formattedDate = moment(dateTime).format("MMM D YYYY hh A");
                data[index].formattedDate = formattedDate;
                if (state.selectedData === 'stats') data[index].revenue = Math.round(data[index].revenue * 100) / 100;
            });
        } else {
            data.map((dataObject, index) => {
                data[index].id = index;             
            });
        }
        
        await this.setState({ ...this.state, data});
    }


    async handleDataSelection(selectedData) {
        await this.setState({ ...this.state, selectedData });
        await this.fetchData();
    }

    render() {
    
        const { state } = this;

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
                
                </Grid>
                <Grid item xs={10}>
                <DataTable
                    data={state.data}
                    selectedData={state.selectedData}
                />
        </Grid>
        </Grid>

            </div>
        )
    }
}