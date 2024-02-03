import faker from 'faker';

export function shortId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
}

export function makeData(count) {
  let data = [];
  let options = [];
  for (let i = 0; i < count; i++) {
    let row = {
      ID: faker.mersenne.rand(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      age: Math.floor(20 + Math.random() * 20),
      music: faker.music.genre(),
    };
    options.push({ label: row.music, backgroundColor: randomColor() });

    data.push(row);
  }

  options = options.filter(
    (a, i, self) => self.findIndex(b => b.label === a.label) === i
  );

  let columns = [
    {
      id: 'firstName',
      label: 'First Name',
      accessor: 'firstName',
      minWidth: 100,
      dataType: DataTypes.TEXT,
      options: [],
    },
    {
      id: 'lastName',
      label: 'Last Name',
      accessor: 'lastName',
      minWidth: 100,
      dataType: DataTypes.TEXT,
      options: [],
    },
    {
      id: 'age',
      label: 'Age',
      accessor: 'age',
      width: 80,
      dataType: DataTypes.NUMBER,
      options: [],
    },
    {
      id: 'email',
      label: 'E-Mail',
      accessor: 'email',
      width: 300,
      dataType: DataTypes.TEXT,
      options: [],
    },
    {
      id: 'music',
      label: 'Music Preference',
      accessor: 'music',
      dataType: DataTypes.SELECT,
      width: 200,
      options: options,
    },
    {
      id: Constants.ADD_COLUMN_ID,
      width: 20,
      label: '+',
      disableResizing: true,
      dataType: 'null',
    },
  ];
  return { columns: columns, data: data, skipReset: false };
}

export function transformToTableData(jsonData) {
  const data = jsonData.entries.map(entry => ({
    id: entry.id,
    headForm: entry.headForm,
    variantForms: entry.variantForms,
    definition: entry.definition,
    translationEquivalents: entry.translationEquivalents,
    links: entry.links,
    linkedEntries: entry.linkedEntries,
    metadata: entry.metadata,
    notes: entry.notes,
  }));

  const columns = [
    { id: 'id', label: 'ID', accessor: 'id', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'headForm', label: 'Head Form', accessor: 'headForm', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'variantForms', label: 'Variant Forms', accessor: 'variantForms', minWidth: 100, dataType: DataTypes.TEXT, options: []},
    { id: 'definition', label: 'Definition', accessor: 'definition', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'translationEquivalents', label: 'Translation Equivalents', accessor: 'translationEquivalents', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'links', label: 'Links', accessor: 'links', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'linkedEntries', label: 'Linked Entries', accessor: 'linkedEntries', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'metadata', label: 'Metadata', accessor: 'metadata', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    { id: 'notes', label: 'Notes', accessor: 'notes', minWidth: 100, dataType: DataTypes.TEXT, options: [] },
    // Add other columns as necessary
  ];

  return { columns, data, skipReset: false };
}

export function transformToJSONFormat(tableData) {
  const entries = tableData.data.map(row => ({
    id: row.id,
    headForm: row.headForm,
    definition: row.definition,
    variantForms: [],
    translationEquivalents: [],
    links: [],
    linkedEntries: [],
    metadata: {},
    notes: []
  }));

  const xfrmdToJSON = {
    id: "uniqueDictionaryId", // This might need to be dynamically set based on your requirements
    label: "Example Dictionary", // This might also need to be dynamically set
    entries,
    metadata: {}
  };
  console.log('transformToJSONFormat')
  console.log({ xfrmdToJSON });

  return {
    id: "uniqueDictionaryId", // This might need to be dynamically set based on your requirements
    label: "Example Dictionary", // This might also need to be dynamically set
    entries,
    metadata: {}
  };
}

export const ActionTypes = Object.freeze({
  ADD_OPTION_TO_COLUMN: 'add_option_to_column',
  ADD_ROW: 'add_row',
  UPDATE_COLUMN_TYPE: 'update_column_type',
  UPDATE_COLUMN_HEADER: 'update_column_header',
  UPDATE_CELL: 'update_cell',
  ADD_COLUMN_TO_LEFT: 'add_column_to_left',
  ADD_COLUMN_TO_RIGHT: 'add_column_to_right',
  DELETE_COLUMN: 'delete_column',
  ENABLE_RESET: 'enable_reset',
  LOAD_DATA: 'loaddata',
});

export const DataTypes = Object.freeze({
  NUMBER: 'number',
  TEXT: 'text',
  SELECT: 'select',
});

export const Constants = Object.freeze({
  ADD_COLUMN_ID: 999999,
});
