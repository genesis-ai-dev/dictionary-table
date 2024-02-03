import { vscode } from "./utilities/vscode";
import React, { useEffect, useReducer } from 'react';
import './style.css';
import Table from './Table';
import {
  randomColor,
  shortId,
  // makeData,
  transformToTableData,
  transformToJSONFormat,
  ActionTypes,
  DataTypes,
} from './utils';
import update from 'immutability-helper';
//@ts-ignore
// const vscode = acquireVsCodeApi();

function reducer(state: any, action: any) {
  console.log({ action });
  switch (action.type) {
    case ActionTypes.ADD_OPTION_TO_COLUMN:
      const optionIndex = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      return update(state, {
        skipReset: { $set: true },
        columns: {
          [optionIndex]: {
            options: {
              $push: [
                {
                  label: action.option,
                  backgroundColor: action.backgroundColor,
                },
              ],
            },
          },
        },
      });
    case ActionTypes.ADD_ROW:
      return update(state, {
        skipReset: { $set: true },
        data: { $push: [{}] },
      });
    case ActionTypes.UPDATE_COLUMN_TYPE:
      const typeIndex = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      switch (action.dataType) {
        case DataTypes.NUMBER:
          if (state.columns[typeIndex].dataType === DataTypes.NUMBER) {
            return state;
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data: any) =>
                  data.map((row: any) => ({
                    ...row,
                    [action.columnId]: isNaN(row[action.columnId])
                      ? ''
                      : Number.parseInt(row[action.columnId]),
                  })),
              },
            });
          }
        case DataTypes.SELECT:
          if (state.columns[typeIndex].dataType === DataTypes.SELECT) {
            return state;
          } else {
            let options: any = [];
            state.data.forEach((row: any) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: randomColor(),
                });
              }
            });
            return update(state, {
              skipReset: { $set: true },
              columns: {
                [typeIndex]: {
                  dataType: { $set: action.dataType },
                  options: { $push: options },
                },
              },
            });
          }
        case DataTypes.TEXT:
          if (state.columns[typeIndex].dataType === DataTypes.TEXT) {
            return state;
          } else if (state.columns[typeIndex].dataType === DataTypes.SELECT) {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
            });
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data: any) =>
                  data.map((row: any) => ({
                    ...row,
                    [action.columnId]: row[action.columnId] + '',
                  })),
              },
            });
          }
        default:
          return state;
      }
    case ActionTypes.UPDATE_COLUMN_HEADER:
      const index = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      return update(state, {
        skipReset: { $set: true },
        columns: { [index]: { label: { $set: action.label } } },
      });
    case ActionTypes.UPDATE_CELL:
      return update(state, {
        skipReset: { $set: true },
        data: {
          [action.rowIndex]: { [action.columnId]: { $set: action.value } },
        },
      });
    case ActionTypes.ADD_COLUMN_TO_LEFT:
      const leftIndex = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      let leftId = shortId();
      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              leftIndex,
              0,
              {
                id: leftId,
                label: 'Column',
                accessor: leftId,
                dataType: DataTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });
    case ActionTypes.ADD_COLUMN_TO_RIGHT:
      const rightIndex = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      const rightId = shortId();
      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              rightIndex + 1,
              0,
              {
                id: rightId,
                label: 'Column',
                accessor: rightId,
                dataType: DataTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });
    case ActionTypes.DELETE_COLUMN:
      const deleteIndex = state.columns.findIndex(
        (column: any) => column.id === action.columnId
      );
      return update(state, {
        skipReset: { $set: true },
        columns: { $splice: [[deleteIndex, 1]] },
      });
    case ActionTypes.ENABLE_RESET:
      return update(state, { skipReset: { $set: true } });
    case ActionTypes.LOAD_DATA:
      return {
        ...state,
        data: action.data,
        columns: action.columns,
        skipReset: false,
      };
    default:
      return state;
  }
}

// declare global {
//   interface Window {
//     initialData: any;
//   }
// }

function App() {
  // const data = window.initialData;
  console.log('Hello from react table webview!');
  // const [state, dispatch] = useReducer(reducer, makeData(1000));
  const [state, dispatch] = useReducer(reducer, { columns: [], data: [], skipReset: false });


  useEffect(() => {
    dispatch({ type: ActionTypes.ENABLE_RESET });
    console.log('Data changed');
  }, [state.data, state.columns]);

  useEffect(() => {
    const tableData = { data: state.data, columns: state.columns }; // Adjust according to the actual structure
    const jsonData = transformToJSONFormat(tableData);
    vscode.postMessage({
      command: 'updateData',
      data: jsonData,
    });
    console.log('Data changed and sent back');
  }, [state.data, state.columns]);

  useEffect(() => {
    //once was function, not const
    // function handleReceiveMessage(event: any) {
    const handleReceiveMessage =  (event: MessageEvent) => {
      const message = event.data; // The JSON data our extension sent
      console.log({ message });
      switch (message.command) {
        case 'sendData': {
          console.log('decoded data from file and received in hook');
          console.log({ message });
          const jsonData = JSON.parse(message.data); 
          const tableData = transformToTableData(jsonData);
          dispatch({
            type: ActionTypes.LOAD_DATA,
            data: tableData.data,
            columns: tableData.columns,
          });
          break;
        }
      }
    };
    window.addEventListener('message', handleReceiveMessage);

    // Make sure to clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('message', handleReceiveMessage);
    };
  }, []);

  // post message back to extension
  vscode.postMessage({
    command: 'dataReceived',
    data: state,
  });


  return (
    <div
      className="overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        padding: 10,
      }}
    >
      <div style={{ marginBottom: 40, marginTop: 40 }}>
        <h1>Editable React Table - Demo</h1>
      </div>
      <Table
        columns={state.columns}
        data={state.data}
        dispatch={dispatch}
        skipReset={state.skipReset}
      />
      <div id="popper-portal"></div>
    </div>
  );
}

export default App;
