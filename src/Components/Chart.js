import React, { Component } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import Grid from '@material-ui/core/Grid';

// Components
import DataSelection from './DataSelection';
import CategorySelection from './CategorySelection';
import TimeframeSelection from './TimeframeSelection';

import ChartColors from './ColorConstants/ChartColors';

import axios from 'axios';
import moment from 'moment';

export default class Chart extends Component {
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
        const res = await axios.get(`http://localhost:5555/${state.selectedData}/${state.dayView ? 'daily' : 'hourly'}`);
        const data = res.data;
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

        const { revenue, clicks, impressions } = state.selectedCategories;
        let dualAxis = statsMode && (revenue || clicks) && impressions;
 
        return (
            <div>
                <Grid container spacing={3}>
                <Grid item xs={2}>
                <Grid>
                <DataSelection 
                    selected={state.selectedData} selections={['events', 'stats']} 
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
                <ResponsiveContainer width="90%" height="100%">
                <BarChart
                    data={state.data}
                >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedDate" />
          {dualAxis && <YAxis yAxisId="left" orientation="left" stroke={ChartColors.PRIMARY} />}
          {dualAxis && <YAxis yAxisId="right" orientation="right" stroke={ChartColors.SECONDARY} />}
          {!dualAxis && <YAxis />}
          <Tooltip />
          <Legend />
          
          {dualAxis && revenue && <Bar yAxisId="left" dataKey="revenue" fill={ChartColors.PRIMARY} />}
          {dualAxis && clicks && <Bar yAxisId="left" dataKey="clicks" fill={ChartColors.PRIMARY} />}
          {dualAxis && impressions && <Bar yAxisId="right" dataKey="impressions" fill={ChartColors.SECONDARY} />}
          {!dualAxis && statsMode && revenue && <Bar dataKey="revenue" fill={ChartColors.PRIMARY} />}
          {!dualAxis && statsMode && clicks && <Bar dataKey="clicks" fill={ChartColors.PRIMARY} />}
          {!dualAxis && statsMode && impressions && <Bar dataKey="impressions" fill={ChartColors.SECONDARY} />}

          {(state.selectedData !== 'stats') && <Bar dataKey="# events" fill={ChartColors.SECONDARY} />}
            
          }
          <div> Adjust Timeframe:</div>
          <Brush dataKey="formattedDate" height={30} stroke="#000000" />
          
        </BarChart>
        </ResponsiveContainer>
        </Grid>
        </Grid>

            </div>
        )
    }
}