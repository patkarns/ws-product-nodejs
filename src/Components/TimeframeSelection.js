import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, FormControl, FormLabel } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

export default function TimeframeSelection(props) {
  const classes = useStyles();
  
  const [state, setState] = React.useState({
    checked: true,
  });

  async function handleChange(event) {
    await setState({ ...state, [event.target.name]: event.target.checked });
    await props.handleTimeframeToggle();
  };

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">Daily/Hourly</FormLabel>
      <Switch checked={props.dayView} onChange={handleChange} name="checked" color="default"/>
  </FormControl>
  );
}