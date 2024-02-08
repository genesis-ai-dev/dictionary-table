import React, { useState } from 'react';
import { ActionTypes } from '../utils';

export default function CheckboxCell({
  columnId,
  rowIndex,
  dataDispatch,
}) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e) => {
    setChecked(e.target.checked);
    dataDispatch({
      type: ActionTypes.UPDATE_CELL,
      columnId,
      rowIndex,
      value: e.target.checked,
    });
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
    />
  );
}