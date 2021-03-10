import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';

// Components
import DataSelection from './DataSelection';
import TimeframeSelection from './TimeframeSelection';
import DataTable from './DataTable';

import axios from 'axios';
import moment from 'moment';

export default function TableDisp(props) {
    const [data, setData] = useState([]);
    const [selectedData, setSelectedData] = useState('stats');
    const [dayView, setDayView] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState({
        'impressions': true,
        'clicks': true,
        'revenue': true
    });

    useEffect(() => {
        async function fetchData() {
            let endPoint = `${selectedData}`;
            // let endPoint = `http://localhost:5555/${selectedData}`;
            if (selectedData !== 'poi') endPoint = `${endPoint}/${dayView ? 'daily' : 'hourly'}`;
    
            const res = await axios.get(endPoint);
            const data = res.data
            if (dayView && (selectedData !== 'poi')) {
                data.map((dataObject, index) => {
                    data[index].id = index;
                    const formattedDate = moment(dataObject.date).format("MMM D YYYY");
                    data[index].formattedDate = formattedDate;
                    data[index].formattedUNIX = moment(dataObject.date).unix();
                    if (selectedData === 'stats') data[index].revenue = Math.round(data[index].revenue * 100) / 100;
                });
            } else if (selectedData !== 'poi') {
                data.map((dataObject, index) => {
                    data[index].id = index;
                    const dateTime = moment(dataObject.date).add(dataObject.hour, 'hours');
                    const formattedDate = moment(dateTime).format("MMM D YYYY hh A");
                    data[index].formattedDate = formattedDate;
                    if (selectedData === 'stats') data[index].revenue = Math.round(data[index].revenue * 100) / 100;
                });
            } else {
                data.map((dataObject, index) => {
                    data[index].id = index;             
                });
            }
            
            setData(data);
        }
        fetchData();

    }, []);

    function handleTimeframeToggle() {
        setDayView(!dayView);
    };

    function handleDataSelection(updatedSelectedData) {
        setSelectedData(updatedSelectedData);
    };

    render() {
    
        const { state } = this;

        return (
            <div>
                <Grid container spacing={3}>
                <Grid item xs={2}>
                <Grid>
                <DataSelection 
                    selected={state.selectedData} selections={['events', 'stats', 'poi']} 
                    handleSelection={handleDataSelection}/>
                </Grid>
                <Grid>
                { (state.selectedData !== 'poi') && 
                    <TimeframeSelection
                        selected={state.dayView ? 'daily' : 'hourly'}
                        selections={['daily', 'hourly']}
                        handleTimeframeToggle={handleTimeframeToggle}
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