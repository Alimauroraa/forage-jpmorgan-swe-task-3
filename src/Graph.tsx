import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    // Note about DOM:
    // - Document Object Model (DOM) is a programming API for HTML and XML documents
    // - Defines the logical structure of documents and the way a document is accessed and manipulated
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {                //we change it to ratio as we  want to track the ratio
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',            // we're tracking all with respect to time
      upper_bound: 'float',
      lower_bound:  'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]'); //takes the x-axis, it allows to map each datapoint based on its timestamp, without this, the x-axis would be blank
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]'); //allows us to focus on particular part of datapoint's data along the y-axis
      elem.setAttribute('aggregates', JSON.stringify({  //allow us to handle the duplicate data and consolidate them into one data point
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg'
      }));
    }
  }

   componentDidUpdate() {
    if (this.table) {
        this.table.update([
                DataManipulator.generateRow(this.props.data),
            ] as unknown as TableData);
    }
  }
}

export default Graph;
