import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, FormControlLabel, FormLabel, FormGroup, Checkbox } from '@material-ui/core/';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function CategorySelection(props) {
  const classes = useStyles();

  async function handleChange(selection) {
    await props.handleSelection(selection);
  };

  const categoryItems = Object.keys(props.selectedCategories).map(categoryName => {
    return 
        <FormControlLabel
          key={categoryName}
          control={<Checkbox checked={props.selectedCategories[categoryName]} onChange={() => handleChange(categoryName)} name={categoryName} />}
        label={categoryName}
      />
  });


  return (
    <div>
       <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Display Subcategories</FormLabel>
        <FormGroup>
          {categoryItems}
          <FormControlLabel
            control={<Checkbox checked={props.selectedCategories.impressions} onChange={() => handleChange('impressions')} name="impressions" />}
            label="impressions"
          />
          <FormControlLabel
            control={<Checkbox checked={props.selectedCategories.clicks} onChange={() => handleChange('clicks')} name="clicks" />}
            label="clicks"
          />
          <FormControlLabel
            control={<Checkbox checked={props.selectedCategories.revenue} onChange={() => handleChange('revenue')} name="revenue" />}
            label="revenue"
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}