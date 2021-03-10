import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { MenuItem, FormControl, FormLabel, Select} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function DataSelection(props) {
  const [dataSelection, setDataSelection] = React.useState('');
  const classes = useStyles();

  async function handleChange(e) {
    setDataSelection(e.target.value);
    await props.handleSelection(e.target.value);
  };

  const dataItems = props.selections.map(selection => {
    return <MenuItem value={selection}>{selection}</MenuItem>
  });


  return (
       <FormControl component="fieldset" className={classes.formControl}>
       <FormLabel component="legend">Select Category</FormLabel>
        <Select
          labelId="data-select-label"
          id="data-select"
          value={dataSelection ? dataSelection : props.selected}
          onChange={handleChange}
        >
            {dataItems}

        </Select>
      </FormControl>
  );
}