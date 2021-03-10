import React from 'react';
import MaterialTable from 'material-table'


const eventsCols = [
  { field: 'formattedDate', title: 'Date', flex: 1 },
  { field: 'events', title: 'Events', flex: 1 },
];

const statsCols = [
  { field: 'formattedDate', title: 'Date', flex: 1 },
  { field: 'impressions', title: 'Impressions', type: 'numeric', flex: 1},
  { field: 'clicks', title: 'Clicks', type: 'numeric', flex: 1 },
  { field: 'revenue', title: 'Revenue', type: 'numeric', flex: 1 },
]

const poiCols = [
    { field: 'poi_id', title: 'ID', flex: 1 },
    { field: 'name', title: 'Name', type: 'string', flex: 1 },
    { field: 'lat', title: 'Lat', type: 'numeric', flex: 1},
    { field: 'lon', title: 'Lon', type: 'numeric', flex: 1 },
  ]

export default function DataTable(props) {
  return (
    <div style={{ height: 600, width: '100%' }}>
    <MaterialTable
        data={props.data} 
        columns={(props.selectedData === 'stats') ? statsCols : (props.selectedData === 'events' ? eventsCols : poiCols)
        }
        options={{
            search: true
        }}
        title={props.selectedData.length ? 
            `${props.selectedData.charAt(0).toUpperCase()}${props.selectedData.slice(1)}`
            : ''}
     />
  </div>
  );
}